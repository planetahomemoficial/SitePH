// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// lastmod do sitemap vem do campo `date` do frontmatter dos artigos.
// Categorias e home usam a data do artigo mais recente que listam.
// Páginas institucionais ficam sem lastmod (não há data confiável).
const articlesDir = fileURLToPath(new URL('./src/content/articles/', import.meta.url));
const articles = readdirSync(articlesDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const raw = readFileSync(articlesDir + file, 'utf8');
    return {
      slug: file.replace(/\.md$/, ''),
      date: raw.match(/^date:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1],
      category: raw.match(/^categorySlug:\s*"?([^"\r\n]+)"?\s*$/m)?.[1],
    };
  })
  .filter((article) => article.date);

/** @type {Map<string, string>} caminho -> data AAAA-MM-DD */
const lastmodByPath = new Map();
let newestOverall = '';
for (const { slug, date, category } of articles) {
  lastmodByPath.set(`/${slug}/`, /** @type {string} */ (date));
  if (category) {
    const key = `/categoria/${category}/`;
    if (!lastmodByPath.has(key) || /** @type {string} */ (date) > /** @type {string} */ (lastmodByPath.get(key))) {
      lastmodByPath.set(key, /** @type {string} */ (date));
    }
  }
  if (/** @type {string} */ (date) > newestOverall) newestOverall = /** @type {string} */ (date);
}
if (newestOverall) lastmodByPath.set('/', newestOverall);

// https://astro.build/config
export default defineConfig({
  site: 'https://planetahomem.com.br',
  integrations: [
    sitemap({
      serialize(item) {
        const date = lastmodByPath.get(new URL(item.url).pathname);
        if (date) item.lastmod = new Date(`${date}T00:00:00Z`).toISOString();
        return item;
      },
    }),
  ],
});
