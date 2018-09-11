/**
 * With needed help from developers.google.com/web/fundamentals/primers/service-workers
 * Caching static files using service worker
 */
var staticCacheName = 'restaurant-info';
var urlsToCache = [
  //cache all static files
  './',     
  './index.html',
  './restaurant.html',
  './js/dbhelper.js',
  './js/main.js',
  './js/idb.js',
  './js/restaurant_info.js',
  './manifest.json',
  './sw.js',
  './img/',
  './icon-192x192.png',
  './icon-512x512.png',
  './favicon.ico',
  './css/styles.css',
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
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(thisCachName) {
        //If this was a previous cache
        if (thisCachName !== staticCacheName) {
          //Delete the cached file
          console.log('Deleting old cached files');
          return caches.delete(thisCachName);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      } else {
        return fetch(event.request);
      }
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});