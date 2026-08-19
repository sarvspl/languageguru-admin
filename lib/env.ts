/**
 * Environment configuration — the single place that reads process.env.
 *
 * NEXT_PUBLIC_API_URL is required and has no fallback. Next.js inlines
 * NEXT_PUBLIC_* at build time, so a missing value used to become the hardcoded
 * localhost default and appear to work in development while pointing at nothing
 * in production. It now fails loudly instead.
 *
 * API_URL can be set separately for server-side rendering, for cases where the
 * container reaches the API on a different host than the browser does.
 */
const RAW_PUBLIC = process.env.NEXT_PUBLIC_API_URL;
const RAW_SERVER = process.env.API_URL;

const PLACEHOLDERS = ['CHANGE_ME', 'changeme', 'your-api-url'];

function clean(value: string | undefined): string | null {
  if (!value) return null;
  const v = value.trim().replace(/\/+$/, '');
  if (!v || PLACEHOLDERS.some((p) => v.includes(p))) return null;
  return v;
}

function resolve(): string {
  // On the server prefer API_URL (an internal address) and fall back to the
  // public one; in the browser only the public one exists.
  const isServer = typeof window === 'undefined';
  const value = isServer ? clean(RAW_SERVER) || clean(RAW_PUBLIC) : clean(RAW_PUBLIC);

  if (!value) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env and set it — for example ' +
        'NEXT_PUBLIC_API_URL=http://localhost:5000 — then restart the dev server. ' +
        'Next.js inlines NEXT_PUBLIC_* at build time, so a running server will not pick it up.'
    );
  }
  return value;
}

export const API_URL: string = resolve();

/** Build an absolute API URL. `path` may start with or without a slash. */
export const api = (path: string): string => `${API_URL}/${String(path).replace(/^\/+/, '')}`;

/**
 * Public website origin, used for the "preview live page" links.
 * Required — these links previously hardcoded http://localhost:3000, which
 * pointed at the developer's own machine once deployed.
 */
const RAW_SITE = process.env.NEXT_PUBLIC_SITE_URL;

export const SITE_URL: string = (() => {
  const value = clean(RAW_SITE);
  if (!value) {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL is not set. Copy .env.example to .env.local and set it — ' +
        'for example NEXT_PUBLIC_SITE_URL=http://localhost:3000 — then restart the dev server.'
    );
  }
  return value;
})();

/** Build an absolute URL on the public website. */
export const siteLink = (path = ''): string =>
  `${SITE_URL}/${String(path).replace(/^\/+/, '')}`;
