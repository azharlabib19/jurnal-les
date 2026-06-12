// SAINSPIQ Service Worker - v1
// Letakkan file ini di ROOT repo GitHub Pages (sama level dengan index.html)

const CACHE_NAME = 'sainspiq-cache-v1';

// Aset yang di-cache saat install
const PRECACHE_ASSETS = [
  '/'
];

// Install: pre-cache halaman utama
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first, fallback ke cache
self.addEventListener('fetch', (event) => {
  // Hanya handle GET request
  if (event.request.method !== 'GET') return;

  // Skip request ke API Supabase / eksternal agar selalu fresh
  const url = new URL(event.request.url);
  const isExternal = !url.origin.includes(self.location.hostname);
  if (isExternal) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Simpan ke cache jika berhasil
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
