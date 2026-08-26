/**
 * Path prefix the admin panel is served under.
 *
 * Configured dynamically via environment variables:
 * - In local development: defaults to '' so admin is accessed at http://localhost:3001/
 * - In production (if hosted under a subpath e.g. /admin): set NEXT_PUBLIC_BASE_PATH=/admin
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Build an absolute path inside the admin panel. */
export const adminPath = (path = ''): string => {
  const cleanPath = String(path).replace(/^\/+/, '');
  if (!BASE_PATH) return `/${cleanPath}`;
  return `${BASE_PATH}/${cleanPath}`;
};
