// service-worker.js (Dengan SVG Lokal di Cache)

// Ganti ke versi baru setiap ada perubahan signifikan pada file yang dicache
const CACHE_NAME = 'refleksi-diri-cache-v1.4';

// Daftar file inti dan ilustrasi lokal yang akan dicache
const urlsToCache = [
  './', // Root/index.html
  './index.html',
  './styles.css',
  './main.js',
  './manifest.json',
  './icons/logo192.png',
  './icons/logo512.png',
  // Tambahkan path ke SVG lokal Anda (sesuaikan nama file!)
  './illustrations/ilustrasi-baik.svg',
  './illustrations/ilustrasi-netral.svg',
  './illustrations/ilustrasi-buruk.svg',
  './illustrations/ilustrasi-default.svg'
];

// Install event: Cache core assets
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching core assets:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Installation complete, assets cached.');
        self.skipWaiting(); // Aktifkan worker baru segera
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete, old caches removed.');
      return self.clients.claim(); // Ambil kontrol klien
    })
  );
});

// Fetch event: Serve from cache first (Cache-First strategy)
self.addEventListener('fetch', event => {
  // Hanya handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          // console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Not in cache - fetch from network
        // console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            // Periksa jika response valid (penting!)
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
               // Jangan cache response yang tidak valid atau dari origin berbeda (kecuali memang diizinkan/diperlukan)
              if (!event.request.url.startsWith(self.location.origin)){
                 // console.log('[SW] Not caching opaque/cross-origin response:', event.request.url);
                 return networkResponse;
              }
            }

            // Clone response karena akan digunakan oleh cache dan browser
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // console.log('[SW] Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.warn('[SW] Fetch failed; returning offline fallback maybe?', event.request.url, error);
          // Di sini Anda bisa menambahkan fallback jika fetch gagal total
          // Contoh: return caches.match('./offline.html');
          // Atau kembalikan response error sederhana agar tidak crash
          return new Response('Network error or resource not found', {
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
