# The one-pager diagrams

Two illustrations, one per printable sheet:

| File | Band | Page | Ratio |
| --- | --- | --- | --- |
| `how-it-works.svg` | "How it works" | `/app` | 1040:340 |
| `pantry-point-pilot.svg` | "How the pilot ran" | `/pantry-point` | 1200:240 |

**Both files in here are placeholders.** They are schematics of their
compositions, not art — dashed outlines and a "placeholder" label, so neither
can be mistaken for finished work or shipped by accident.

## Replacing one

Overwrite the file. Nothing in the codebase changes — the pages reference them
by path through `<img>`.

## What every replacement needs

These four apply to both files. What is specific to each is below.

**1. No words in the artwork.** The captions are HTML, underneath the picture.
Text baked into the image cannot be selected or translated, does not reflow —
so at 320px it scales down until it is unreadable — and collapses into a single
`alt` attribute for anyone using a screen reader.

This is also why each `<img>` is `alt=""`. Everything the diagram says is
already said in the text directly beneath it, so alt text would make a screen
reader read the section twice. **If you deliver art that does carry its own
lettering, that changes** — the image then needs a real description and the HTML
captions need to become screen-reader-only. Say so rather than dropping it in
silently.

**2. Keep the aspect ratio.** Each page hard-codes its diagram's ratio as
`aspect-ratio` in its own style block, to reserve the box before the file loads
so the captions below do not jump. A different ratio means changing that one
number too.

**3. Legibility at two very different sizes.** These render around 1100px wide
on a desktop screen, and are capped at roughly an inch and a quarter tall in the
PDF. Fine detail will disappear on the printed sheet.

**4. Colour is unconstrained.** The pages' own palette is brand green
(`#106535`) on the ink-50 band (`#f7f7f6`), but these are images rather than
tokens, so full-colour illustration is fine. Two things to check: that it still
reads on that band, and that it survives printing on white.

## `how-it-works.svg` — a hub

Not a left-to-right pipeline. Erika and Serjio both post, and both arrows run
*right* into the phone. Phoebe reads that same phone from the other side, so
both of her arrows run *left* into it. Everything points at the app. That
convergence is what made the original 2019 flyer read as a story rather than
three paragraphs, and it is the thing worth preserving.

## `pantry-point-pilot.svg` — a funnel into a pipeline

Deliberately the opposite shape, which is why these two cannot share one
drawing. Two routes to credits come in from the left — a survey, or a purchase
— and they **merge**. From the merge it is a single line: phone, machine, food.

The canvas is 5:1, and much flatter than `/app`'s on purpose. On the printed
sheet this drawing is capped by *height* — the page has about an inch for it and
far more width than it needs — so a taller canvas does not buy a bigger picture,
it buys a narrower one floating in white space with the caption columns running
past it on both sides. Flatter is the only axis it can grow on.

The merge is the whole point of the picture. Both routes ended at the same
machine, drawing on the same account, which is what made it impossible to tell
from the outside who had paid — the argument the page leads with. Art that keeps
the two routes separate all the way to the machine draws the opposite claim.

## The PDF budget

Each one-pager has to stay on a single Letter page. `yarn build:pdf` fails the
build if either spills onto a second, and reports how much room is left on both,
so a taller diagram will be caught rather than shipped.

If replacement art needs more room, the `height` in that page's `.flow-diagram`
print rule is the number to raise, and something else on that sheet has to give
it back. Note that both drawings are capped by *height* rather than width: they
are wide enough relative to the printable box that height is the only constraint
that binds.
