/**
 * Renders print-shaped routes out of the built site as PDFs. Run via
 * `yarn build:pdf`, after `yarn build`.
 *
 * WHY GENERATE IT RATHER THAN CHECK IN A FILE.
 *
 * The obvious alternative is to export the one-pager from Illustrator once and
 * drop the PDF in `public/`. That was rejected because it creates a second
 * copy of the copy. The moment a sentence on /app is reworded the download
 * disagrees with the page, silently, and nothing in CI can tell. Rendering the
 * route means the page IS the flyer and the PDF cannot drift from it.
 *
 * WHY CHROMIUM.
 *
 * Playwright is already a devDependency for the accessibility gate, and both
 * CI and the deploy already install the browser and cache it. So this costs a
 * few seconds and no new dependency. It also means the PDF is laid out by the
 * same engine that renders the page, against the same `@media print` rules —
 * a PDF-specific layout library would be a third rendering of the same content
 * with its own bugs.
 *
 * OUTPUT GOES TO dist/, NOT public/.
 *
 * A file in `public/` is an input to the build; this is an output of it, and
 * it depends on the build having happened. Writing to `dist/` keeps it out of
 * git and off the list of things that can go stale. The consequence is that
 * the download link 404s under `astro dev` — the file only exists after a real
 * build. That is the right trade: a stale committed PDF is a worse failure
 * than a dev-only broken link.
 */

import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const DIST = 'dist';

/**
 * Route to render, the file it becomes, and how long it is allowed to be.
 * Adding a second printable sheet later means adding a line here and a print
 * block on that page.
 *
 * `maxPages` is the point of the exercise. A one-pager that quietly becomes a
 * two-pager is still a valid PDF and still builds green, so the length has to
 * be asserted or it is not really a constraint. Copy grows, and the sheet is
 * within about half an inch of full.
 */
const SHEETS = [{ route: '/app', out: 'share-meals-app.pdf', maxPages: 1 }];

/**
 * Page count, read back off the rendered bytes.
 *
 * Playwright does not report it, and pulling in a PDF parser to learn one
 * integer is not worth the dependency. Chromium writes uncompressed page
 * objects, so counting `/Type /Page` (excluding the `/Pages` tree node, which
 * shares the prefix) is reliable for this one producer. It is deliberately not
 * a general-purpose PDF reader — if the count ever looks wrong, distrust this
 * function first.
 */
function countPages(bytes) {
  return (bytes.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
};

if (!existsSync(DIST)) {
  console.error(`\n  No ${DIST}/ directory. Run \`yarn build\` first.\n`);
  process.exit(1);
}

/** Same minimal static server as the accessibility gate, and same reasoning:
 *  twenty lines beats a dependency for serving one directory to one browser. */
function serve() {
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = join(DIST, path);
      if (path.endsWith('/')) file = join(file, 'index.html');
      // Astro is configured with `trailingSlash: 'ignore'`, so /app is a real
      // route but resolves to a directory on disk.
      if (!existsSync(file) || (await stat(file)).isDirectory()) {
        file = join(file, 'index.html');
      }
      const body = await readFile(file);
      res.writeHead(200, {
        'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () =>
      resolve({ server, port: server.address().port }),
    );
  });
}

const { server, port } = await serve();
const base = `http://127.0.0.1:${port}`;

const browser = await chromium.launch();
const context = await browser.newContext();

console.log('\nRendering printable sheets\n');

let failures = 0;

for (const { route, out, maxPages } of SHEETS) {
  const page = await context.newPage();

  const response = await page.goto(base + route, { waitUntil: 'load' });
  if (!response?.ok()) {
    console.log(`  FAIL  ${route} — ${response?.status() ?? 'no response'}`);
    failures++;
    await page.close();
    continue;
  }

  // Onest is self-hosted and loaded with `font-display: swap`. Without waiting
  // the PDF can capture the fallback stack mid-swap, which changes every line
  // break on the sheet.
  await page.evaluate(() => document.fonts.ready);

  // Chromium applies `@media screen` to `page.pdf()` by default. The print
  // block on the page is the entire layout, so this is not optional.
  await page.emulateMedia({ media: 'print' });

  const pdf = await page.pdf({
    format: 'Letter',
    // Backgrounds carry the green panel headings. Without this they print as
    // white-on-white and the sheet loses its headings entirely.
    printBackground: true,
    // Margins come from the page's own `@page` rule, so that printing from a
    // browser and downloading the file give the same result.
    preferCSSPageSize: true,
  });

  await page.close();

  const pages = countPages(pdf);
  const kb = Math.round(pdf.length / 1024);

  if (pages > maxPages) {
    // Written anyway, so the overflow can be looked at rather than guessed at.
    await writeFile(join(DIST, out), pdf);
    console.log(
      `  FAIL  ${route}  ->  ${out}  (${pages} pages, max ${maxPages})`,
    );
    console.log(
      `        The sheet no longer fits. Either cut copy or tighten the`,
    );
    console.log(
      `        @media print rules in src/pages${route}.astro. Written to`,
    );
    console.log(`        ${join(DIST, out)} so it can be inspected.`);
    failures++;
    continue;
  }

  await writeFile(join(DIST, out), pdf);
  console.log(
    `  ok    ${route}  ->  ${out}  (${pages} page${pages === 1 ? '' : 's'}, ${kb} KB)`,
  );
}

await context.close();
await browser.close();
server.close();

console.log('');

if (failures > 0) process.exit(1);
