// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Organization site: served at the ROOT of share-meals.github.io, so there is
// no base path and internal links are plain absolute paths like "/press".
//
// AT DOMAIN CUTOVER: change `site` to 'https://sharemeals.org'. That is the
// only line that changes — base stays '/', so no links need touching.
const site = 'https://share-meals.github.io';

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
