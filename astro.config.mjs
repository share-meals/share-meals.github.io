// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Deployed to a GitHub Pages *project* page until the domain cutover.
//
// AT LAUNCH: set site to 'https://sharemeals.org' and base to '/'. Those are the
// only two lines that change. Everything else works because internal links go
// through BASE_URL rather than hardcoded absolute paths — see src/lib/url.ts.
const site = 'https://jonathan-chin.github.io';
const base = '/sharemeals-website';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
