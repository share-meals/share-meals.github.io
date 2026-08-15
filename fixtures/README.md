# Fixtures

Sample data, kept out of `src/` and `public/` so none of it can be imported by
the site or served from the built output.

## `public-stats.dummy.json`

A response in the shape of Directus `GET /public-stats`, which fills the
"The work, in numbers" band on the home page.

**Every number in it is invented.** They are shaped to be plausible for Share
Meals rather than arbitrary, which makes them more dangerous, not less — a
plausible fake is the kind that gets quoted. Nothing here may be used in copy,
a grant application, a deck, or anything else that leaves a screen. The only
real figures come from the live endpoint.

What *is* faithful to the real response: the shape, the invariant that region
rows sum exactly to the totals across all five metrics, the row ordering
(community count descending, then region name, `null` bucket last), and the
fact that every metric is a JSON number rather than a numeric string.

`generated_at` is deliberately hours before the file was written, because the
real payload is cached for up to a day. Anything that assumes these numbers
are live should show itself.

### Using it

Development only. A deployed build always fetches a live Directus; this file
takes no part in it.

`yarn dev` uses this file automatically when `PUBLIC_DIRECTUS_URL` is unset,
so the band is there while working on the page with nothing else running. Set
`PUBLIC_DIRECTUS_URL` to work against a real backend instead; it takes
precedence.

For a built page — `yarn preview`, or running the WCAG gate over the band —
the same fallback is opt-in, because a build is a thing that can be deployed:

```bash
USE_DUMMY_STATS=1 yarn build && yarn preview
```

That variable must be set in the shell. Putting it in `.env` will not work:
Astro only surfaces `PUBLIC_`-prefixed variables, and does not load `.env`
files into `process.env`.

The build prints a warning while the flag is on, and the page logs one in the
console. The variable is never set in CI or the deploy workflow, so this
cannot reach production by accident — but do not deploy a build made with it.

To work against real data instead, point at a Directus that is running:

```bash
PUBLIC_DIRECTUS_URL=http://localhost:8055 yarn build && yarn preview
```
