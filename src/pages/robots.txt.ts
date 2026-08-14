import type { APIRoute } from 'astro';

/**
 * /robots.txt — generated, not a static file in public/.
 *
 * The reason is the `Sitemap:` line: the robots.txt spec requires it to be an
 * absolute URL, so a hand-written file would hardcode the domain. Building it
 * from `site` keeps the cutover to sharemeals.org a one-line change in
 * astro.config.mjs, exactly as the comment there promises.
 *
 * The policy itself is deliberately permissive — everything published here is
 * meant to be found. robots.txt is a crawling directive, not an access control
 * and not a way to keep a page out of search results: a disallowed URL can
 * still be indexed from inbound links, and only a `noindex` meta tag actually
 * suppresses a result. Nothing on this site needs either.
 */
export const GET: APIRoute = ({ site }) => {
  // `site` is set in astro.config.mjs, so this is never undefined in practice.
  // new URL() rather than string concatenation, which would double or drop the
  // slash depending on how `site` was written.
  const sitemap = new URL('sitemap-index.xml', site);

  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap.href}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
