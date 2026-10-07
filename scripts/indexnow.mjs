// Avisa Bing e demais buscadores com IndexNow sobre URLs novas/alteradas.
// Uso: node scripts/indexnow.mjs <slug|url> [...]   (URLs ou slugs explícitos)
//      node scripts/indexnow.mjs --git             (artigos adicionados/alterados no último commit)
//      node scripts/indexnow.mjs --all             (todas as URLs do sitemap publicado)
import { execSync } from 'node:child_process';

const HOST = 'planetahomem.com.br';
const SITE = `https://${HOST}`;
const KEY = '3e2d407b9e7d98f88a843591ec5b5ee9';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const toUrl = (value) => {
  if (value.startsWith('http')) return value;
  return `${SITE}/${value.replace(/^\/+|\/+$/g, '')}/`;
};

async function urlsFromSitemap() {
  const res = await fetch(`${SITE}/sitemap-0.xml`);
  if (!res.ok) throw new Error(`sitemap-0.xml respondeu ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}

function urlsFromLastCommit() {
  const out = execSync('git diff --name-only --diff-filter=AM HEAD~1 HEAD', { encoding: 'utf8' });
  return out
    .split(/\r?\n/)
    .filter((file) => /^src\/content\/articles\/.+\.md$/.test(file))
    .map((file) => toUrl(file.replace(/^src\/content\/articles\//, '').replace(/\.md$/, '')));
}

const args = process.argv.slice(2);
let urls;
if (args.includes('--all')) urls = await urlsFromSitemap();
else if (args.includes('--git')) urls = urlsFromLastCommit();
else urls = args.map(toUrl);

urls = [...new Set(urls)];
if (urls.length === 0) {
  console.log('Nenhuma URL pra enviar.');
  process.exit(0);
}

const keyCheck = await fetch(KEY_LOCATION);
const keyBody = (await keyCheck.text()).trim();
if (!keyCheck.ok || keyBody !== KEY) {
  console.error(`Arquivo da chave não está acessível/correto em ${KEY_LOCATION} (status ${keyCheck.status}). Aguarde o deploy e tente de novo.`);
  process.exit(1);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls }),
});

const meaning = {
  200: 'OK: URLs recebidas',
  202: 'Aceito: recebido, validação da chave pendente',
  400: 'Requisição inválida',
  403: 'Chave inválida ou arquivo da chave não encontrado',
  422: 'URLs não pertencem ao host ou chave não confere',
  429: 'Muitas requisições',
};
console.log(`IndexNow -> HTTP ${res.status}: ${meaning[res.status] ?? 'resposta inesperada'}`);
console.log(`${urls.length} URL(s) enviada(s):`);
for (const url of urls.slice(0, 10)) console.log(`  ${url}`);
if (urls.length > 10) console.log(`  ... e mais ${urls.length - 10}`);
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
