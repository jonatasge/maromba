const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
  "/manifest",
  "/manifest/index.html",
  "/manifest/style.css",
  "/manifest/script.js",
  "/manifest/assets/icon-192x192.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
