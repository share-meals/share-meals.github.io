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

Verify against the **production build** (`yarn build && yarn preview`), not the
dev server — the Astro dev toolbar injects its own focusable elements and will
distort keyboard and landmark testing.

Automated checks catch a minority of this. Tab through the page.

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
