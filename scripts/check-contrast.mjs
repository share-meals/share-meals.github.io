/**
 * WCAG 2.1 contrast audit for the design tokens.
 *
 * Treats accessibility as a constraint on the palette rather than a check run
 * after the design is built. Run via `yarn check:contrast`; it exits non-zero
 * so it can gate the build once the real palette lands.
 *
 * Thresholds: normal text 4.5:1, large text (>=24px or >=18.66px bold) 3:1.
 */

const TOKENS = {
  'brand-700': '#106535',
  'brand-600': '#1e7746',
  'brand-500': '#2f9159',
  'ink-900': '#1c1c1a',
  'ink-600': '#5c5c56',
  'ink-400': '#93938c',
  'ink-50': '#f7f7f6',
  white: '#ffffff',
};

/** Pairings the design is allowed to rely on. Each must pass at its level. */
const CLEARED = [
  ['ink-900', 'white', 'normal', 'text on surface'],
  ['ink-600', 'white', 'normal', 'text-muted on surface'],
  ['brand-700', 'white', 'normal', 'brand-700 on surface'],
  ['white', 'brand-700', 'normal', 'text-inverse on surface-inverse'],
  ['ink-900', 'ink-50', 'normal', 'text on surface-muted'],
  ['ink-600', 'ink-50', 'normal', 'text-muted on surface-muted'],
  ['brand-700', 'ink-50', 'normal', 'brand-700 on surface-muted'],
];

/** Pairings documented as unusable for body text. Asserted to actually fail,
 *  so the warning stays true if values change. */
const EXPECTED_FAIL = [
  ['brand-500', 'white', 'normal', 'brand-500 on white'],
  ['ink-400', 'white', 'normal', 'ink-400 on white'],
];

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const threshold = (level) => (level === 'large' ? 3 : 4.5);
let failed = 0;

console.log('\nCLEARED pairings — must pass\n');
for (const [fg, bg, level, label] of CLEARED) {
  const r = ratio(TOKENS[fg], TOKENS[bg]);
  const need = threshold(level);
  const ok = r >= need;
  if (!ok) failed++;
  console.log(
    `  ${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (needs ${need}:1)  ${label}`,
  );
}

console.log('\nDocumented as NOT cleared — must actually fail\n');
for (const [fg, bg, level, label] of EXPECTED_FAIL) {
  const r = ratio(TOKENS[fg], TOKENS[bg]);
  const need = threshold(level);
  const stillFails = r < need;
  if (!stillFails) {
    failed++;
    console.log(
      `  STALE ${r.toFixed(2).padStart(5)}:1  ${label} now PASSES — update the docs in global.css`,
    );
  } else {
    console.log(`  ok    ${r.toFixed(2).padStart(5)}:1  ${label} (correctly restricted)`);
  }
}

console.log(
  failed === 0 ? '\nContrast audit passed.\n' : `\nContrast audit FAILED (${failed}).\n`,
);
process.exit(failed === 0 ? 0 : 1);
