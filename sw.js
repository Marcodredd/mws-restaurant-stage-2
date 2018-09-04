/**
 * With needed help from developers.google.com/web/fundamentals/primers/service-workers
 * Caching static files using service worker
 */
var staticCacheName = 'restaurant-info';
var urlsToCache = [
  //cache all static files
  '/',     // index.html
  'restaurant.html',
  'js/dbhelper.js',
  'js/main.js',
  'js/idb.js',
  'js/restaurant_info.js',
  'manifest.json',
  'sw.js',
  'img/',
  'icon-192x192.png',
  'icon-512x512.png',
  'favicon.ico',
  'css/styles.css',
  'http://localhost:1337/restaurants'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName)
    .then(function(cache) {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

//Delete old cache
self.addEventListener('activate', function(event) {
  // console.log("Service Worker activated");
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-info') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

//Fetch event
self.addEventListener('fetch', function(event) {
  // console.log("Service Worker starting fetch");
  event.respondWith(
    caches.open(staticCacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        if (response) {
          // console.log("data fetched from cache");
          return response;
        }
        else {
          return fetch(event.request).then(function(networkResponse) {
            // console.log("data fetched from network", event.request.url);
            //cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(function(error) {
            console.log("The fetch request resulted in an error", event.request.url, error);
          });
        }
      });
    }).catch(function(error) {
      console.log("Fetch failed", error);
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});