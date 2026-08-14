import { defineCollection } from 'astro:content';
// `z` re-exported from 'astro:content' is deprecated in Astro 7.
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Content lives as markdown in src/content/<collection>/. Adding a press
 * mention or a post means adding a .md file — never editing a template. That
 * is the whole point of the rebuild.
 *
 * Schemas are enforced at build time, so a typo'd or missing frontmatter field
 * fails the build with a precise message instead of rendering a broken page.
 *
 * PROVISIONAL: these fields cover the current site's content. Confirm and
 * extend during the content conversation.
 */

const press = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/press' }),
  schema: z.object({
    /** Headline as published. */
    title: z.string(),
    /** Outlet name, e.g. "The New York Times". */
    publication: z.string(),
    date: z.coerce.date(),
    /** Link to the article. External, so a full URL. */
    url: z.url(),
    /** Optional pull quote or one-line summary. */
    excerpt: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    /** Drafts are excluded from production builds. */
    draft: z.boolean().default(false),
  }),
});

const initiatives = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/initiatives' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    /** Controls display order; lower sorts first. */
    order: z.number().default(100),
    status: z.enum(['active', 'past']).default('active'),
  }),
});

export const collections = { press, news, initiatives };
