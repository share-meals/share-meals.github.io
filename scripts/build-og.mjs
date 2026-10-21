/**
 * Renders the social preview card, `public/og.png`, the image link previews
 * show when a sharemeals.org URL is shared. Run via `yarn build:og` and commit
 * the result.
 *
 * WHY COMMITTED, UNLIKE THE PDFs.
 *
 * The one-pager PDFs are rendered from routes and go to dist/, because their
 * copy lives on the page and would drift. This card has no page behind it:
 * it is the tagline, which is fixed, set in the brand face on the brand
 * green. It is an input to the build, so it belongs in public/. Re-run this
 * only if the tagline, the typeface or the green changes.
 *
 * Same engine as the PDFs and the accessibility gate, so no new dependency.
 * The font and the logomark are inlined as data URLs so the page needs no
 * server.
 */

import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const OUT = 'public/og.png';
const WIDTH = 1200;
const HEIGHT = 630;

const font = (await readFile('public/fonts/onest.woff2')).toString('base64');
const mark = (await readFile('public/logomark.svg')).toString('base64');

// Colours are the site's own tokens from global.css: brand-700 (#106535) is
// the field, white type on it is 7.16:1.
const html = `<!doctype html>
<html><head><style>
  @font-face {
    font-family: Onest;
    src: url(data:font/woff2;base64,${font}) format('woff2');
    font-weight: 100 900;
  }
  html, body { margin: 0; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px; box-sizing: border-box;
    padding: 72px 80px; background: #106535; color: #fff;
    font-family: Onest, sans-serif;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  h1 {
    margin: 0; font-size: 128px; line-height: 1.0; font-weight: 800;
    letter-spacing: -0.03em;
  }
  footer { display: flex; align-items: center; gap: 20px; }
  footer img { width: 64px; height: 64px; }
  footer span { font-size: 36px; font-weight: 800; letter-spacing: -0.01em; }
</style></head>
<body>
  <h1>Food is a<br>human right.</h1>
  <footer>
    <img src="data:image/svg+xml;base64,${mark}" alt="">
    <span>Share Meals</span>
  </footer>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: OUT });
  console.log(`\n  Wrote ${OUT} (${WIDTH}x${HEIGHT}).\n`);
} finally {
  await browser.close();
}
