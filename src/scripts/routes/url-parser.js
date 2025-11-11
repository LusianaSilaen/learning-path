/**
 * Utility untuk memecah URL hash (#/...) menjadi segmen dan route
 * agar bisa digunakan oleh router utama di App.js
 */

function extractPathnameSegments(path) {
  const splitUrl = path.split('/');
  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = '';
  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }
  if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }
  return pathname || '/';
}

/**
 * Mengambil hash aktif dari URL (tanpa simbol #)
 * Contoh:
 * - '#/add' → '/add'
 * - '#/about/' → '/about'
 * - '#' atau '' → '/'
 */
export function getActivePathname() {
  const hash = window.location.hash || '#/';
  return hash.replace(/^#/, '').replace(/\/+$/, '') || '/';
}

/**
 * Mengembalikan route aktif berdasarkan hash URL
 * Contoh:
 * - '#/add' → '/add'
 * - '#/about' → '/about'
 * - '#/story/123' → '/story/:id'
 */
export function getActiveRoute() {
  const pathname = getActivePathname().toLowerCase(); // konsisten lowercase
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

/**
 * Mengembalikan objek segmen dari hash aktif
 * Contoh hasil:
 *  { resource: 'story', id: 'abc123' }
 */
export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

/**
 * Mengonversi path tertentu menjadi format route
 * Contoh: '/story/123' → '/story/:id'
 */
export function getRoute(pathname) {
  const cleanPath = pathname.replace(/\/+$/, '').toLowerCase();
  const urlSegments = extractPathnameSegments(cleanPath);
  return constructRouteFromSegments(urlSegments);
}

/**
 * Memecah pathname menjadi bagian-bagian resource & id
 */
export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}
