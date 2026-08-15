# Publication logos

Artwork for the "Featured in" band on `/app`. **The directory is empty on
purpose** — the band renders each name as a wordmark until a logo exists.

## Adding one

Drop the SVG in here, then set `logo` on the matching entry in the `credits`
array at the top of `src/pages/app.astro`:

```js
{ name: 'The New York Times', logo: '/logos/nyt.svg' },
```

That is the whole change. Leave `logo: null` and the name renders as text.

## What the artwork has to be

**Light-on-dark.** The band is brand green (`#106535`). A dark or
full-colour mark will disappear into it. Most brand pages publish a white or
reversed ("knockout") variant — use that one.

**Sized by height, not width.** `.credit-logo` fixes the height (2.75rem on
screen, 15pt in the PDF) and lets the width follow, so marks of different
proportions sit optically level. Trim tight to the ink; built-in padding will
make one mark look smaller than its neighbour.

**Given real `alt` text** — the band's whole point is *which* publications these
are, so the alt is the publication name. The page does this automatically from
the `name` field; nothing to do.

## Where it has to come from

These are other organisations' trademarks. Take the current official asset from
the owner's own brand or press page. Do not trace one, and do not lift one from
`designs/sma-one-pager.svg` — that flyer is from 2019 and its masthead may no
longer be the mark the publication uses.

**TEDx has extra rules.** TED's TEDx brand guidelines govern the mark and
normally require the "x = independently organized TED event" tagline wherever
it appears — the 2019 flyer carries exactly that line under the logo, which is
almost certainly why. That tagline was removed from this band on request, so
check TED's current guidelines before publishing the logo without it.
