import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Fonte única das categorias. O painel (public/admin/config.yml) oferece estes mesmos nomes
// e o endereço da categoria é derivado daqui, então o campo categorySlug no arquivo é opcional.
const CATEGORIAS: Record<string, string> = {
  "Acessórios": "acessorios",
  "Casamento & Sexualidade": "casamento-e-sexualidade",
  "Celulares": "celulares",
  "Dinheiro, Carreira & IA": "dinheiro-carreira-e-ia",
  "Eletrônicos": "eletronicos",
  "Esportes": "esportes",
  "Estilo Masculino": "estilo-masculino",
  "Homem, Propósito & Fé": "homem-proposito-e-fe",
  "Musculação": "musculacao",
  "Saúde Masculina": "saude-masculina",
  "Viagens": "viagens",
};

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z
    .object({
      title: z.string(),
      category: z.string().refine((nome) => nome in CATEGORIAS, {
        message: `Categoria desconhecida. Use uma destas: ${Object.keys(CATEGORIAS).join(" | ")}`,
      }),
      categorySlug: z.string().optional(),
      excerpt: z.string(),
      image: z.string(),
      imageCredit: z.string().optional(),
      date: z.coerce.date(),
      author: z.string().default("Planeta Homem"),
    })
    .transform((dados) => ({ ...dados, categorySlug: CATEGORIAS[dados.category] })),
});

export const collections = { articles };
