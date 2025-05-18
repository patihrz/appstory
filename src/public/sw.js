// Lokasi file ini seharusnya: src/public/sw.js (berdasarkan vite.config.js Anda)

// Impor skrip Workbox dari CDN untuk kemudahan
try {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js'); // Ganti dengan versi terbaru jika perlu
} catch (e) {
  console.error('Workbox gagal dimuat dari CDN:', e);
}

if (workbox) {
  console.log(`Workbox berhasil dimuat 🎉`);

  workbox.core.setCacheNameDetails({
    prefix: 'dicoding-story-app',
    suffix: 'v1.2', // Naikkan versi jika ada perubahan signifikan
    precache: 'precache',
    runtime: 'runtime',
  });

  // PRECACHING - Aset inti aplikasi (Application Shell)
  // Path di bawah ini adalah relatif terhadap root yang disajikan oleh Vite (yaitu, folder 'src/' Anda).
  // File dari 'src/public/' juga disajikan dari root.
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: '2' }, // Merujuk ke src/index.html
    { url: '/index.html', revision: '2' }, // Merujuk ke src/index.html
    { url: '/manifest.webmanifest', revision: '2' }, // Merujuk ke src/public/manifest.webmanifest
    { url: '/styles/styles.css', revision: '2' }, // Merujuk ke src/styles/styles.css
    { url: '/scripts/index.js', revision: '2' },  // Merujuk ke src/scripts/index.js (entry point utama JS Anda)
    { url: '/scripts/pages/app.js', revision: '2' }, // Merujuk ke src/scripts/pages/app.js
    { url: '/icons/icon-192x192.png', revision: '2' }, // Merujuk ke src/public/icons/icon-192x192.png
    { url: '/icons/icon-512x512.png', revision: '2' }, // Merujuk ke src/public/icons/icon-512x512.png
    { url: '/vite.svg', revision: '2' }, // Merujuk ke src/public/vite.svg (jika masih digunakan)
    // Tambahkan halaman offline kustom jika ada, misal:
    // { url: '/offline.html', revision: '1' }, // Merujuk ke src/public/offline.html
  ], {
    ignoreURLParametersMatching: [/.*/],
  });

  // STRATEGI CACHING RUNTIME

  // 1. Cache First untuk Font dari Google Fonts
  workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 tahun
          maxEntries: 30,
        }),
      ],
    })
  );

  // 2. StaleWhileRevalidate untuk Aset Aplikasi (CSS, JS yang mungkin di-load dinamis)
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'style' || request.destination === 'script' || request.destination === 'worker',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources-runtime', // Nama cache berbeda untuk runtime
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // 3. Cache First untuk Gambar
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
        }),
      ],
    })
  );

  // 4. StaleWhileRevalidate untuk Permintaan API Dicoding Story (GET requests)
  workbox.routing.registerRoute(
    ({url, request}) => url.origin === 'https://story-api.dicoding.dev' && 
                       url.pathname.startsWith('/v1/stories') &&
                       request.method === 'GET', // Hanya cache permintaan GET
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'dicoding-story-api-cache',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 1 * 60 * 60, // Cache data API selama 1 jam
        }),
      ],
    })
  );

  // Navigation Fallback (opsional, jika Anda membuat offline.html)
  // Pastikan '/offline.html' ada di precache list jika Anda menggunakan ini
  // const offlineFallback = '/offline.html'; 
  // workbox.routing.setDefaultHandler(new workbox.strategies.NetworkOnly());
  // workbox.routing.setCatchHandler(({event}) => {
  //   switch (event.request.destination) {
  //     case 'document':
  //       return caches.match(offlineFallback);
  //     default:
  //       return Response.error();
  //   }
  // });


  // --- Logika untuk Push Notification ---
  self.addEventListener('push', (event) => {
    console.log('Service Worker: Pesan push diterima.');
    let notificationData = {
      title: 'Dicoding Story App',
      options: {
        body: 'Ada cerita baru untukmu!',
        icon: '/icons/icon-192x192.png', // Pastikan path ini benar (merujuk ke src/public/icons/)
        badge: '/icons/icon-96x96.png', // Pastikan path ini benar
        data: { url: '/' } // URL default jika notifikasi diklik
      },
    };
    if (event.data) {
      try {
        const payload = event.data.json();
        console.log('Service Worker: Payload push:', payload);
        if (payload.title) notificationData.title = payload.title;
        if (payload.options) {
          notificationData.options = { ...notificationData.options, ...payload.options };
        }
        if (payload.options && payload.options.data && payload.options.data.url) {
            notificationData.options.data.url = payload.options.data.url;
        }
      } catch (e) {
        console.error('Service Worker: Gagal mem-parse payload push sebagai JSON, menggunakan data default.', e);
        notificationData.options.body = event.data.text();
      }
    }
    event.waitUntil(self.registration.showNotification(notificationData.title, notificationData.options));
  });

  self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notifikasi diklik.');
    event.notification.close();
    const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (new URL(client.url).pathname === new URL(urlToOpen, self.location.origin).pathname && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  });
  // --- Akhir Logika Push Notification ---

  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

} else {
  console.log(`Workbox gagal dimuat.`);
}