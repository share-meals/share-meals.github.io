/**
 * WCAG 2.2 AA gate. Run via `yarn check:a11y`, after `yarn build`.
 *
 * WHY A REAL BROWSER, NOT jsdom.
 *
 * The cheaper option is axe-core over the built HTML in jsdom, with no browser
 * binary to install or rot. It was rejected: jsdom does no layout, so exactly
 * the criteria a design-led site is most likely to regress — rendered contrast,
 * reflow, target size — are the ones it silently cannot evaluate. A gate that
 * skips the failure modes you actually have is worse than no gate, because it
 * reports green.
 *
 * WHY THE BUILT OUTPUT, NOT THE DEV SERVER.
 *
 * The Astro dev toolbar injects its own focusable elements into the page and
 * distorts keyboard and landmark results. AGENTS.md requires verifying against
 * the production build for this reason, and so does this script.
 *
 * WHAT THIS COVERS, AND WHAT IT DOES NOT.
 *
 * axe-core is thorough but it is not a compliance certificate — it catches
 * something like a third to a half of WCAG issues in practice. It cannot judge
 * whether alt text is *accurate*, whether headings *describe* their sections,
 * whether link text makes sense out of context, or whether a keyboard order is
 * *sensible* rather than merely present. Those stay human. This gate exists to
 * stop regressions, not to certify conformance.
 */

import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const DIST = 'dist';

/** Conformance target. Kept in one place so raising the bar is a one-line change. */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Rules axe classifies as "best-practice" rather than tagging to a WCAG
 * success criterion, which means the tag filter above silently skips them.
 *
 * These are enforced anyway because AGENTS.md commits to them by name. A
 * skipped heading level sailed through the first version of this gate for
 * exactly this reason. Run as a separate pass: `withRules` restricts a run to
 * only the rules listed, so it cannot be combined with `withTags`.
 */
const EXTRA_RULES = [
  'heading-order',
  'page-has-heading-one',
  'landmark-one-main',
  'landmark-unique',
  'region',
];

/** Reflow (1.4.10) is specified at 320 CSS px. */
const REFLOW_WIDTH = 320;

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

/** Every built page, as a route. Nothing to keep in sync as pages are added. */
async function routes(dir = DIST, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await routes(full, acc);
    else if (entry.name === 'index.html') {
      const rel = relative(DIST, full).replace(/index\.html$/, '');
      acc.push('/' + rel);
    }
  }
  return acc;
}

/**
 * Minimal static server. Deliberately hand-rolled rather than pulling in a
 * server package: it is 20 lines and this project keeps its dependency surface
 * small on purpose.
 */
function serve() {
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = join(DIST, path);
      if (path.endsWith('/')) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

const { server, port } = await serve();
const base = `http://127.0.0.1:${port}`;
const pages = (await routes()).sort();

const browser = await chromium.launch();
const results = [];

for (const route of pages) {
  // Desktop pass: the full ruleset, including rendered colour contrast.
  // An explicit context is required — @axe-core/playwright rejects pages
  // created straight off the browser's default context.
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(base + route, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const desktop = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const extras = await new AxeBuilder({ page }).withRules(EXTRA_RULES).analyze();

  // Reflow pass: 1.4.10 forbids horizontal scrolling at 320px. axe does not
  // check this, so it is measured directly.
  await page.setViewportSize({ width: REFLOW_WIDTH, height: 800 });
  const reflow = await page.evaluate(() => {
    const d = document.documentElement;
    const offenders = [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > d.clientWidth + 1)
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`);
    return { scrollWidth: d.scrollWidth, clientWidth: d.clientWidth, offenders };
  });

  // Narrow-viewport axe pass: catches contrast and target-size problems that
  // only appear once the layout has reflowed.
  const mobile = await new AxeBuilder({ page }).withTags(TAGS).analyze();

  await context.close();
  results.push({ route, desktop, extras, mobile, reflow });
}

await browser.close();
server.close();

let failures = 0;
const seen = new Set();

console.log(`\nWCAG 2.2 AA gate — ${pages.length} page(s), axe-core + reflow\n`);

for (const { route, desktop, extras, mobile, reflow } of results) {
  const violations = [
    ...desktop.violations,
    ...extras.violations,
    ...mobile.violations,
  ].filter((v) => {
    const key = route + v.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const scrolls = reflow.scrollWidth > reflow.clientWidth + 1;
  const ok = violations.length === 0 && !scrolls;

  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${route}`);

  for (const v of violations) {
    failures++;
    console.log(`        [${v.impact}] ${v.id} — ${v.help}`);
    for (const node of v.nodes.slice(0, 3)) {
      console.log(`          ${node.target.join(' ')}`);
      const detail = (node.failureSummary ?? '').split('\n').map((l) => l.trim()).filter(Boolean)[1];
      if (detail) console.log(`            ${detail}`);
    }
    console.log(`          ${v.helpUrl}`);
  }

  if (scrolls) {
    failures++;
    console.log(
      `        [serious] reflow — horizontal scrolling at ${REFLOW_WIDTH}px ` +
        `(${reflow.scrollWidth}px > ${reflow.clientWidth}px)`,
    );
    if (reflow.offenders.length) {
      console.log(`          widest: ${reflow.offenders.join(', ')}`);
    }
    console.log('          https://www.w3.org/WAI/WCAG22/Understanding/reflow.html');
  }
}

const checked = results.reduce(
  (n, r) => n + r.desktop.passes.length + r.extras.passes.length + r.mobile.passes.length,
  0,
);
console.log(`\n  ${checked} axe checks passed across ${pages.length} page(s).`);
console.log(
  failures === 0
    ? '\nAccessibility gate passed.\n'
    : `\nAccessibility gate FAILED (${failures} issue${failures === 1 ? '' : 's'}).\n`,
);

process.exit(failures === 0 ? 0 : 1);
