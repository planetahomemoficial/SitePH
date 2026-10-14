// Lista os artigos dos três sites da rede (Planeta Homem, Amiga Beauty, Invisto no Meu Filho)
// para escolher links cruzados com URLs reais, já conferidas.
//
// Uso: node scripts/rede-inventario.mjs                      (todos os sites, só as URLs)
//      node scripts/rede-inventario.mjs --titles             (abre cada página: título e status HTTP)
//      node scripts/rede-inventario.mjs --site=invisto       (planetahomem | amigabeauty | invisto)
//      node scripts/rede-inventario.mjs --titles --out=docs/rede-inventario.md
//
// Só LÊ os sites (GET). Não altera nada em nenhum deles. Com --titles, marca páginas vazias
// (marcador de pauta) e textos curtos, para não linkar para conteúdo que não existe.
import { writeFileSync } from 'node:fs';

const SITES = {
  planetahomem: {
    nome: 'Planeta Homem',
    base: 'https://planetahomem.com.br',
    sitemaps: ['/sitemap-0.xml', '/sitemap-index.xml'],
    artigo: (path) => /^\/[a-z0-9-]+\/$/.test(path) && !/^\/(categoria|sobre|contato|politica|termos)/.test(path),
  },
  amigabeauty: {
    nome: 'Amiga Beauty',
    base: 'https://amigabeauty.com.br',
    sitemaps: ['/sitemap.xml', '/sitemap-0.xml'],
    // sem sitemap por enquanto: lê a home e as categorias e junta os links /blog/
    rastrear: true,
    artigo: (path) => path.startsWith('/blog/') && path !== '/blog/',
  },
  invisto: {
    nome: 'Invisto no Meu Filho',
    base: 'https://invistonomeufilho.com.br',
    sitemaps: ['/sitemap.xml', '/sitemap-0.xml'],
    artigo: (path) => path.startsWith('/artigos/') && path !== '/artigos/',
  },
};

const args = process.argv.slice(2);
const flag = (nome) => args.some((a) => a === `--${nome}` || a.startsWith(`--${nome}=`));
const valor = (nome) => args.find((a) => a.startsWith(`--${nome}=`))?.split('=')[1];
const comTitulos = flag('titles');
const filtro = valor('site');
const saida = valor('out');

const get = async (url) => {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'rede-inventario/1.0' } });
    return { status: res.status, texto: res.ok ? await res.text() : '' };
  } catch {
    return { status: 0, texto: '' };
  }
};

const decodificar = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();

const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]);

async function urlsDoSitemap(site) {
  for (const caminho of site.sitemaps) {
    const { status, texto } = await get(site.base + caminho);
    if (status !== 200) continue;
    let urls = locs(texto);
    // índice de sitemaps: abre cada um
    const filhos = urls.filter((u) => u.endsWith('.xml'));
    if (filhos.length) {
      urls = urls.filter((u) => !u.endsWith('.xml'));
      for (const filho of filhos) urls.push(...locs((await get(filho)).texto));
    }
    if (urls.length) return { urls, origem: `sitemap (${caminho})` };
  }
  return null;
}

async function urlsRastreando(site) {
  const achadas = new Set();
  const home = await get(site.base + '/');
  const hrefs = (html) => [...html.matchAll(/href="([^"#?]+)"/g)].map((m) => m[1]);
  const abs = (h) => (h.startsWith('http') ? h : site.base + h);
  const mesmoSite = (h) => abs(h).startsWith(site.base);
  for (const h of hrefs(home.texto).filter(mesmoSite)) achadas.add(abs(h));
  const categorias = [...achadas].filter((u) => u.includes('/categoria/'));
  for (const cat of categorias) {
    const { texto } = await get(cat);
    for (const h of hrefs(texto).filter(mesmoSite)) achadas.add(abs(h));
  }
  return { urls: [...achadas], origem: 'rastreamento da home e das categorias (sem sitemap)' };
}

async function emLotes(itens, tamanho, fn) {
  const resultado = [];
  for (let i = 0; i < itens.length; i += tamanho) {
    resultado.push(...(await Promise.all(itens.slice(i, i + tamanho).map(fn))));
  }
  return resultado;
}

async function inventario(chave) {
  const site = SITES[chave];
  const achado = (await urlsDoSitemap(site)) ?? (site.rastrear ? await urlsRastreando(site) : { urls: [], origem: 'nenhuma fonte encontrada' });
  const caminho = (u) => new URL(u).pathname;
  const artigos = [...new Set(achado.urls.filter((u) => u.startsWith(site.base) && site.artigo(caminho(u))))].sort();

  let linhas = artigos.map((url) => ({ url, titulo: '', status: '' }));
  if (comTitulos) {
    linhas = await emLotes(artigos, 6, async (url) => {
      const { status, texto } = await get(url);
      const h1 = texto.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
      const title = texto.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
      const miolo = texto.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? texto.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? '';
      const corpo = decodificar(miolo.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' '));
      const palavras = corpo ? corpo.split(' ').length : 0;
      const vazio = /ainda n[aã]o foi escrito/i.test(corpo);
      return { url, titulo: decodificar(h1 ?? title ?? ''), status: String(status), palavras, vazio };
    });
  }
  return { chave, site, origem: achado.origem, linhas };
}

const chaves = filtro ? [filtro] : Object.keys(SITES);
if (filtro && !SITES[filtro]) {
  console.error(`Site desconhecido: ${filtro}. Use: ${Object.keys(SITES).join(', ')}`);
  process.exit(1);
}

const hoje = new Date().toISOString().slice(0, 10);
let md = `# Inventário da rede de sites\n\nGerado em ${hoje} por \`scripts/rede-inventario.mjs\`. Use só URLs com status 200 e confira o conteúdo da página antes de linkar.\n`;
for (const chave of chaves) {
  const r = await inventario(chave);
  md += `\n## ${r.site.nome} (${r.linhas.length} artigos)\n\nFonte: ${r.origem}\n\n`;
  if (!r.linhas.length) { md += '_Nenhum artigo encontrado._\n'; continue; }
  if (comTitulos) {
    md += '| Status | Palavras | Título | URL |\n|---|---|---|---|\n';
    for (const l of r.linhas) md += `| ${l.status} | ${l.vazio ? '**VAZIO (marcador de pauta)**' : l.palavras} | ${l.titulo.replace(/\|/g, '/')} | ${l.url} |\n`;
    const vazios = r.linhas.filter((l) => l.vazio).length;
    const curtos = r.linhas.filter((l) => !l.vazio && l.palavras < 300).length;
    md += `\nAtenção: ${vazios} página(s) vazia(s) e ${curtos} com menos de 300 palavras. Não linke para elas.\n`;
  } else {
    md += r.linhas.map((l) => `- ${l.url}`).join('\n') + '\n';
  }
}

if (saida) { writeFileSync(saida, md, 'utf8'); console.log(`Inventário salvo em ${saida}`); }
else console.log(md);
