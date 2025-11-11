// Service Worker untuk caching dan push notification
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Cache aplikasi saat install
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/app.bundle.js',
        '/styles/styles.css',
        '/images/logo.png', // tambahkan gambar yang perlu di-cache
        // ... tambah file lainnya yang dibutuhkan
      ]);
    })
  );
});

// Fetch event untuk mengambil file dari cache saat offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('push', function (event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/images/notification-icon.png',
    badge: '/images/notification-badge.png',
    data: {
      url: data.url || '/'
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
