const CACHE_NAME = "berbagi-cerita-v1";

// Daftar file yang akan di-cache (app shell)
const urlsToCache = [
  "/", // root
  "./index.html",
  "./app.bundle.js",
  "./main.css",
  "./favicon.png",
  "./manifest.json",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("Gagal cache saat install SW:", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Menghapus cache lama:", cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Kalau ada di cache → pakai cache
      if (response) return response;
      // Kalau tidak ada → fetch ke jaringan
      return fetch(event.request);
    })
  );
});
