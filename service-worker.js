// service-worker.js (Dengan feedback_data.json & SVG Lokal di Cache)

// Ganti ke versi baru setiap ada perubahan signifikan pada file yang dicache
const CACHE_NAME = 'refleksi-diri-cache-v1.6'; // <-- Versi terbaru

// Daftar file inti dan aset lokal yang akan dicache
const urlsToCache = [
  './', // Root/index.html
  './index.html',
  './styles.css',
  './main.js', // File JS utama
  './manifest.json',
  './feedback_data.json', // File data feedback
  './icons/logo192.png', // Ikon PWA
  './icons/logo512.png', // Ikon PWA
  // Path ke SVG lokal Anda (sesuaikan nama file jika berbeda!)
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
        // AddAll akan gagal jika salah satu file tidak ditemukan
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Installation complete, assets cached.');
        self.skipWaiting(); // Aktifkan worker baru segera
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error);
        // Pertimbangkan untuk tidak skipWaiting jika instalasi gagal total
        // agar SW lama tetap aktif jika ada.
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

  // Khusus untuk navigasi halaman (HTML), coba Network first, lalu Cache
  // Ini memastikan pengguna selalu mendapat HTML terbaru jika online
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Jika sukses, simpan ke cache
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Jika network gagal, coba ambil dari cache
          const cachedResponse = await caches.match(event.request);
          // Jika ada di cache, kembalikan. Jika tidak, fallback ke index.html cache
          return cachedResponse || caches.match('./index.html');
        })
    );
    return; // Hentikan eksekusi lebih lanjut untuk navigasi
  }

  // Untuk aset lain (CSS, JS, Gambar, JSON), gunakan Cache-First
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Periksa jika response valid (khususnya untuk file lokal)
            if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && !urlsToCache.includes(event.request.url.replace(self.location.origin, '.')))) {
              // Jangan cache jika tidak valid atau bukan aset yg diharapkan (misal dr CDN lain)
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        ).catch(error => {
          console.warn('[SW] Fetch failed:', event.request.url, error);
          // Kembalikan response error dasar jika fetch gagal total
          return new Response(`Network error: ${error.message}`, {
            status: 408, // Request Timeout atau 500 Internal Server Error
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});
