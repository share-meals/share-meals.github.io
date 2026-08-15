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
| `yarn build:pdf` | Render the printable one-pager into `dist/` |

### The app one-pager

`/app` is both the web page for the Share Meals app and the source of the
printed one-pager. `yarn build:pdf` renders that route through Chromium, using
the `@media print` rules at the foot of `src/pages/app.astro`, and writes
`dist/share-meals-app.pdf` — which is what the download button on the page
points at.

It is generated rather than checked in so the flyer cannot drift from the page:
there is one copy of the copy. The build fails if the sheet stops fitting on one
page, because a one-pager that silently becomes two pages is otherwise a
perfectly valid PDF.

The consequence is that the download link 404s under `yarn dev` — the file only
exists after a real build. Use `yarn build && yarn build:pdf && yarn preview` to
see it work.

It rebuilds the flyer from `designs/sma-one-pager.svg`, the original Illustrator
sheet. That file is kept for reference only; nothing in the build reads it.

### The impact numbers

The band of figures at the foot of the home page is fetched in the browser from
the Directus `/public-stats` endpoint. Point `PUBLIC_DIRECTUS_URL` at the
backend to enable it — see `.env.example`, and the `PUBLIC_DIRECTUS_URL`
repository variable for CI and deploys.

With the variable unset the band is left out of the build, which is the correct
behaviour rather than a degraded one: the numbers are decoration, and every
failure path — no variable, no network, a 500, a malformed payload, no
JavaScript — ends with the band simply not appearing. Nothing on the page
should be written to assume it is there.

`yarn dev` shows the band without any backend running, using invented numbers
from `fixtures/public-stats.dummy.json`. Set `PUBLIC_DIRECTUS_URL` to work
against a real Directus instead — it takes precedence:

```bash
PUBLIC_DIRECTUS_URL=http://localhost:8055 yarn dev
```

For a *built* page the fixture is opt-in, since a build can be deployed:

```bash
USE_DUMMY_STATS=1 yarn build && yarn preview
```

Both paths are loud — the build warns and the page warns in the console — and
neither variable is ever set in CI or the deploy workflow, so a deployed build
always fetches a live Directus. See `fixtures/README.md`; no number in that
file may be used in copy.

The labels are constrained by what the endpoint actually counts.
`servings_offered` is what people *offered*, not what anyone received, so it is
captioned "servings shared" and never "meals served" — and never "meals"
anything, since a serving is not a meal. `src/components/ImpactStats.astro`
carries the reasoning; read it before changing any wording there.

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
