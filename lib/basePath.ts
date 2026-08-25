/**
 * Path prefix the admin panel is served under.
 *
 * Single source of truth: `next.config.ts` feeds it to Next as `basePath`, and
 * the few places that navigate outside the router read it from here. `<Link>`,
 * `useRouter()` and `next/image` all add the prefix on their own — raw
 * `window.location` assignments do not, so those must use BASE_PATH explicitly
 * or they escape the admin panel and land on the public site.
 *
 * Set to '' to serve the admin at the domain root instead.
 */
export const BASE_PATH = '/admin';

/** Build an absolute path inside the admin panel. */
export const adminPath = (path = ''): string =>
  `${BASE_PATH}/${String(path).replace(/^\/+/, '')}`;
