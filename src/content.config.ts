import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    categorySlug: z.string(),
    excerpt: z.string(),
    image: z.string(),
    imageCredit: z.string().optional(),
    date: z.coerce.date(),
    author: z.string().default("Planeta Homem"),
  }),
});

export const collections = { articles };
