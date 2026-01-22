const CACHE_NAME = 'mybrain-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network first for API calls (imports), Cache First for static assets
  if (event.request.url.includes('esm.sh') || event.request.url.includes('cdn.tailwindcss.com')) {
     event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request).then((fetchRes) => {
              return caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, fetchRes.clone());
                  return fetchRes;
              });
          });
        })
     );
  } else {
      event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
      );
  }
});