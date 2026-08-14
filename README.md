# sharemeals.org

Static site for Share Meals, built with [Astro](https://astro.build) and
Tailwind CSS, hosted on GitHub Pages.

## Publishing

`main` is the working branch. Commit to it freely — nothing publishes.

To publish:

```bash
git push origin main:live
```

That pushes `main`'s current commit to the `live` branch, which triggers the
deploy workflow. Nothing is checked out and the working tree is untouched.

`live` is only ever fast-forwarded from `main`. Never commit to it directly.
To re-run a deploy without a new commit, use the "Run workflow" button on the
Deploy action in the GitHub UI.

## Editing content

Content is markdown in `src/content/`. Adding a press mention or a post means
adding a `.md` file — no template editing.

| Collection | Location | What it holds |
|---|---|---|
| `press` | `src/content/press/` | Coverage in outlets |
| `news` | `src/content/news/` | Posts and announcements |
| `initiatives` | `src/content/initiatives/` | Programs |

Frontmatter fields are defined and enforced in `src/content.config.ts`. A
missing or malformed field fails the build with a message naming the file and
field, so a bad edit cannot reach production.

Set `draft: true` on a news post to keep it out of production builds while
leaving it visible in `yarn dev`.

## Local development

```bash
yarn install
yarn dev
```

| Command | Does |
|---|---|
| `yarn dev` | Dev server with hot reload |
| `yarn build` | Production build to `dist/` |
| `yarn preview` | Serve the built site locally |
| `yarn check` | Contrast audit and type check |

## Conventions worth knowing before editing

**Colors and type come from tokens** in `src/styles/global.css`. Only
`#106535` green is final; accent, neutrals, and the typeface are open design
decisions with placeholder values. Components reference semantic slots
(`--color-text`, `--color-surface`) rather than raw ramp steps, so values can
change without touching component code.

**Only AA-cleared color pairings may be used.** The cleared set is listed at the
bottom of `global.css` and verified by `yarn check:contrast`, which runs in CI.

## Dependencies

Deliberately minimal: Astro, Tailwind, and `@astrojs/sitemap`. The previous
version of this site became unmaintainable through dependency rot, so every
addition is a future install failure. Add one only with a real reason.

Yarn 4 with `nodeLinker: node-modules` (see `.yarnrc.yml`) — the PnP default
causes trouble with Vite and some Astro integrations.

## Domain

This is an *organization site*, served at the root of `share-meals.github.io`.
Because there is no base path, internal links are plain absolute paths
(`href="/press"`) and need no helper.

The apex `sharemeals.org` still points at the old Netlify site. At cutover:
change `site` in `astro.config.mjs` to `https://sharemeals.org`, add a `CNAME`
file to `public/`, and point DNS at GitHub Pages. Nothing else changes.
