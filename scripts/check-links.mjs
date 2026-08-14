/**
 * Guards the `base` path decision.
 *
 * The site deploys under `/sharemeals-website` until the domain cutover, so a
 * hardcoded `href="/about"` works in dev and 404s in production — a failure
 * that only appears after deploy, which is the worst time to find it.
 *
 * This fails on literal absolute paths in real HTML attributes, requiring the
 * `url()` helper from src/lib/url.ts instead.
 *
 * Component props are deliberately NOT flagged. `<Button href="/donate">` is
 * correct: Button resolves the path through url() itself, and double-wrapping
 * would produce `/base/base/donate`. The distinction is capitalization —
 * lowercase tags are HTML elements, capitalized tags are Astro components that
 * own their base handling. A checker with false positives gets ignored, which
 * defeats the point of having one.
 *
 * After the cutover to base '/', this check can simply be deleted.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// readdirSync recursive rather than globSync: the latter is still flagged
// experimental in Node 22 and prints a warning into every CI log.
const files = readdirSync('src', { recursive: true, encoding: 'utf8' })
  .filter((f) => /\.(astro|md|mdx|html)$/.test(f))
  .map((f) => join('src', f));

// Opening tags, tolerating multi-line attribute lists, quoted strings, and
// JSX-style {expressions}.
const TAG = /<([A-Za-z][\w.:-]*)((?:[^<>"'{]|"[^"]*"|'[^']*'|\{[^{}]*\})*)\/?>/g;

// Literal absolute path. Protocol-relative (`//cdn…`) is an external URL.
const ATTR = /\b(href|src|action|poster)\s*=\s*"(\/(?!\/)[^"]*)"/g;

let problems = 0;

for (const file of files) {
  const text = readFileSync(file, 'utf8');

  for (const tag of text.matchAll(TAG)) {
    const [, name, attrs] = tag;

    // Capitalized tag => Astro component, responsible for its own base paths.
    if (name[0] === name[0].toUpperCase()) continue;

    for (const attr of attrs.matchAll(ATTR)) {
      problems++;
      const line = text.slice(0, tag.index + attr.index).split('\n').length;
      console.error(
        `  ${file}:${line}\n    <${name} ${attr[1]}="${attr[2]}">` +
          `  → use ${attr[1]}={url('${attr[2]}')}`,
      );
    }
  }
}

if (problems > 0) {
  console.error(
    `\n${problems} hardcoded absolute path(s) found. These break under the` +
      ` GitHub Pages base path.\nImport { url } from '~/lib/url' and wrap them.\n`,
  );
  process.exit(1);
}

console.log(
  `Link audit passed — no hardcoded absolute paths in ${files.length} file(s).`,
);
