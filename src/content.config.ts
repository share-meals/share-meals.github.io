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
 * The press and initiatives collections were removed along with their pages —
 * their schemas mirrored the old site's structure, and the information
 * architecture is being redone from scratch rather than inherited. Add
 * collections back as real sections are decided, not in anticipation of them.
 */

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

export const collections = { news };
