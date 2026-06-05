/* ProcurementHost — Service Worker (PWA offline)
   Strategi: NETWORK-FIRST. Selalu ambil versi terbaru saat online (jadi update
   deploy langsung terlihat), dan pakai cache hanya saat offline. */
const CACHE = 'ph-cache-v1';
const CORE = [
  '/', '/index.html', '/styles.css', '/app.js', '/favicon.svg',
  '/icon-192.png', '/icon-512.png', '/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return; // jangan ganggu pihak ketiga (Google, peta, dll)
  e.respondWith(
    fetch(req)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('/index.html')))
  );
});
