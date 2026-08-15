# The "How it works" diagram

`how-it-works.svg` is the illustration in the "How it works" band on `/app`.

**The file in here is a placeholder.** It is a schematic of the composition,
not art — dashed outlines and a "placeholder" label, so it cannot be mistaken
for finished work or shipped by accident.

## Replacing it

Overwrite the file. Nothing in the codebase changes — `src/pages/app.astro`
references it by path through `<img>`.

## What the replacement needs

**1. The hub composition.** Not a left-to-right pipeline. Erika and Serjio both
post, and both arrows run *right* into the phone. Phoebe reads that same phone
from the other side, so both of her arrows run *left* into it. Everything
points at the app. That convergence is what made the original 2019 flyer read
as a story rather than three paragraphs, and it is the thing worth preserving.

**2. No words in the artwork.** The four captions are HTML, underneath the
picture. Text baked into the image cannot be selected or translated, does not
reflow — so at 320px it scales down until it is unreadable — and collapses into
a single `alt` attribute for anyone using a screen reader.

This is also why the `<img>` is `alt=""`. Everything the diagram says is
already said in the text directly beneath it, so alt text would make a screen
reader read the section twice. **If you deliver art that does carry its own
lettering, that changes** — the image then needs a real description and the
HTML captions need to become screen-reader-only. Say so rather than dropping it
in silently.

**3. Roughly a 1040:340 aspect ratio.** `.flow-diagram` in `app.astro` hard-codes
this as `aspect-ratio`, to reserve the box before the file loads so the captions
below do not jump. A different ratio means changing that one number too.

**4. Legibility at two very different sizes.** It renders about 1100px wide on a
desktop screen, and is capped at 86pt — roughly 1.2 inches tall — in the PDF.
Fine detail will disappear on the printed sheet.

## The PDF budget

The one-pager has to stay on a single Letter page, and it currently does with
about 9px to spare. `yarn build:pdf` fails the build if it spills onto a second
page, so a taller diagram will be caught rather than shipped — but if the art
needs more room, `height` in the `.flow-diagram` print rule is the number to
raise, and something else on the sheet has to give it back.

## Colour

Unconstrained. The page's own palette is brand green (`#106535`) on the ink-50
band (`#f7f7f6`), but this is an image rather than a token, so full-colour
illustration is fine. Two things to check: that it still reads on that band,
and that it survives printing on white.
