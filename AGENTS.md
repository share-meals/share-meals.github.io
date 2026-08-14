## Accessibility — a hard requirement

**Target: WCAG 2.2 Level AA, on every page, at all times.** This is a
constraint on how work is done, not a review step afterwards. A change that
introduces a violation is not finished, regardless of how it looks.

Non-negotiables, each of which has already been built or fixed here:

- **Semantic HTML before ARIA.** A `<button>` over a `<div role="button">`
  every time. The best ARIA is no ARIA.
- **One `<h1>` per page, no skipped heading levels.** Headings describe
  structure; never pick one for its size. The type scale is for that.
- **Every interactive control reachable and operable by keyboard**, in a
  sensible order, with a visible focus indicator. `global.css` sets a 3px
  focus ring at 7.16:1 — never remove it with `outline: none`.
- **Colour is never the only carrier of meaning** (1.4.1), and every pairing
  clears AA contrast. The legal set is listed at the bottom of `global.css`
  and enforced by `yarn check:contrast`. A pairing not on that list has not
  been cleared — add it and verify it, do not just use it.
- **Images:** meaningful ones need real alt text, decorative ones need
  `alt=""`. An icon beside its own label is decorative — alt text there makes
  screen readers announce the name twice.
- **No horizontal scrolling at 320px** (1.4.10), and nothing may clip when
  text spacing is increased (1.4.12).
- **Interactive targets at least 24x24 CSS px** (2.5.8).
- **Visible text and its machine-readable equivalent must agree.** Dates are
  the trap: format them in UTC, or the rendered day drifts from the `datetime`
  attribute anywhere west of UTC.
- **Respect `prefers-reduced-motion`.** Backstopped in `global.css`.

### The gate

`yarn check:a11y` runs axe-core in real Chromium against every built page and
exits non-zero on any violation. It runs in CI on every pull request and every
push to `main`, and again in the deploy workflow — so a violation fails review
first and, failing that, fails the deploy rather than reaching production.

```
yarn check:all     # types + token contrast + build + WCAG gate
yarn check:a11y    # WCAG gate alone — needs `yarn build` first
```

It checks each page at 1280px and again at 320px, because contrast and target
size problems often only appear after the layout reflows, and it measures
reflow itself since axe does not.

**What it cannot do.** axe catches perhaps a third to a half of WCAG issues. It
cannot tell whether alt text is *accurate*, whether a heading *describes* its
section, whether link text makes sense out of context, or whether a keyboard
order is *sensible* rather than merely present. A green gate is not compliance.

Verify by hand against the **production build** (`yarn build && yarn preview`),
never the dev server — the Astro dev toolbar injects its own focusable elements
and will distort keyboard and landmark testing. Tab through the page.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
