const CACHE_NAME = 'mnemonica-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/globals.css',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch((err) => console.error('[Service Worker] Cache error:', err))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls - always hit network
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache API responses
          return response;
        })
        .catch(() => {
          // Return offline error response for API calls
          return new Response(
            JSON.stringify({ error: 'Offline - API unavailable' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // Cache-first strategy for assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        console.log('[Service Worker] Serving from cache:', request.url);
        return response;
      }

      return fetch(request)
        .then((response) => {
          // Clone the response before caching
          if (!response || response.status !== 200 || response.type === 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          console.log('[Service Worker] Network request failed:', request.url);
          // Return a generic offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Background sync for future API calls
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  if (event.tag === 'sync-mnemonics') {
    event.waitUntil(
      // Handle any queued requests
      Promise.resolve()
    );
  }
});
