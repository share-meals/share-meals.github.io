// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Organization site: served at the ROOT of the domain, so there is no base
// path and internal links are plain absolute paths like "/press".
//
// sharemeals.org is the canonical domain. GitHub Pages builds and serves from
// share-meals.github.io, but every absolute URL the site emits — canonicals,
// og:url, the sitemap entries, the Sitemap line in /robots.txt — names the
// apex, so the two hosts never compete as duplicates of each other.
//
// NOTE: this setting does not move the domain. Serving the apex needs DNS
// pointed at GitHub Pages and a CNAME file in public/; until both are done,
// sharemeals.org resolves elsewhere and these URLs run ahead of reality.
const site = 'https://sharemeals.org';

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
