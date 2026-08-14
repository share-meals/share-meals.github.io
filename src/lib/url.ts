/**
 * Build an internal URL that respects the configured `base`.
 *
 * WHY THIS EXISTS: the site currently deploys to a GitHub Pages project page
 * under `/sharemeals-website`, so a hardcoded `href="/about"` works in dev and
 * 404s in production — a failure that only shows up after deploy. Every
 * internal link and asset path must go through this helper.
 *
 * At the domain cutover `base` becomes '/' and this returns plain paths, with
 * no call sites needing to change.
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}
