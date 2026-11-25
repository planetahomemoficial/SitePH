import { getCollection } from "astro:content";

// Série "Homens que marcaram a história". Um artigo entra na série quando a categoria dele é
// "Homens que marcaram a história" (escolhida no painel). Ela tem página própria em /serie/.
export const SERIE = {
  slug: "homens-que-marcaram-a-historia",
  nome: "Homens que marcaram a história",
  subtitulo: "Vidas, decisões e legados que transformaram o mundo.",
  descricao:
    "Série especial do Planeta Homem: homens que construíram e homens que destruíram, contados sem romantizar ninguém, com fontes e com a lição para o homem de hoje.",
  href: "/serie/homens-que-marcaram-a-historia/",
  categoria: "Homens que marcaram a história",
};

/** Endereço da categoria: a série tem página própria em /serie/, as demais ficam em /categoria/. */
export const categoriaHref = (slug: string) => (slug === SERIE.slug ? SERIE.href : `/categoria/${slug}/`);

export const LEGADO_ROTULO: Record<string, string> = {
  positivo: "Legado positivo",
  negativo: "Legado negativo",
  misto: "Legado misto",
};

export interface SerieItem {
  href: string;
  image: string;
  personagem: string;
  frase: string;
  titulo: string;
  legado?: "positivo" | "negativo" | "misto";
}

/** Personagens já publicados, do mais recente para o mais antigo. */
export async function getSerieItems(): Promise<SerieItem[]> {
  const todos = await getCollection("articles");
  return todos
    .filter((a) => a.data.categorySlug === SERIE.slug)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((a) => ({
      href: `/${a.id}/`,
      image: a.data.image,
      personagem: a.data.personagem ?? a.data.title,
      frase: a.data.frase ?? a.data.excerpt,
      titulo: a.data.title,
      legado: a.data.legado,
    }));
}
