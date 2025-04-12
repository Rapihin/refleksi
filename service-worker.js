// service-worker.js

const CACHE_NAME = 'refleksi-diri-cache-v1.1'; // Ubah versi jika ada update signifikan
const urlsToCache = [
  './', // Cache the root/index.html
  './index.html',
  './styles.css',
  './main.js',
  './manifest.json',
  './icons/logo192.png',
  './icons/logo512.png',
  // Tambahkan SVG ilustrasi default jika ingin offline (optional)
  'https://undraw.co/illustrations/thought-process-re-om58.svg',
  // Font URLs (Caching external fonts can be tricky, check license/CORS)
  // 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@700&display=swap',
  // Add specific font files if needed and possible
];

// Install event: Cache core assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core assets');
        // Cache local assets first, handle external potentially failing gracefully
        const localAssets = urlsToCache.filter(url => !url.startsWith('http'));
        const externalAssets = urlsToCache.filter(url => url.startsWith('http'));

        const cacheLocal = cache.addAll(localAssets);
        const cacheExternal = Promise.all(
            externalAssets.map(url => cache.add(url).catch(e => console.warn(`Failed to cache external asset: ${url}`, e)))
        );

        return Promise.all([cacheLocal, cacheExternal]);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete, assets cached.');
        self.skipWaiting(); // Activate worker immediately
      })
      .catch(error => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activation complete, old caches removed.');
      return self.clients.claim(); // Take control of existing clients
    })
  );
});

// Fetch event: Serve from cache or fetch from network (Cache-First for core assets)
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests (HTML pages), try network first, then cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If successful, cache the response
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || caches.match('./index.html'); // Fallback to cached index
          });
        })
    );
    return;
  }

  // For other requests (CSS, JS, Images), use Cache-First strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          // console.log('[Service Worker] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Not in cache - fetch from network
        // console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200) { // Allow 0 for opaque responses if needed, but be careful
              return networkResponse;
            }

            // Clone the response
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Cache the new resource ONLY if it was part of the original urlsToCache
                // or if it's from the same origin. Avoid caching unexpected external resources.
                if (urlsToCache.includes(event.request.url) || event.request.url.startsWith(self.location.origin)) {
                   cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          }
        ).catch(error => {
          console.warn('[Service Worker] Fetch failed; returning offline fallback if available.', error);
          // Optionally, return a generic offline fallback image/page here if needed
        });
      })
  );
});
