/**
 * Backend origin (no path, no trailing slash).
 * Production: set REACT_APP_API_URL in .env (e.g. https://api.yourdomain.com)
 */
export const API_ORIGIN = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(
  /\/$/,
  ''
);

/** Full URL for /api/... paths */
export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (p.startsWith('/api')) return `${API_ORIGIN}${p}`;
  return `${API_ORIGIN}/api${p}`;
}
