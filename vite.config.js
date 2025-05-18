import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    VitePWA({
      // injectRegister: 'auto', // atau 'script' atau null
      registerType: 'autoUpdate', // Otomatis update service worker
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'], // File apa saja yang dipertimbangkan untuk precache
        // runtimeCaching akan tetap berguna untuk API, font, dll.
      },
      manifest: { // Konfigurasi manifest.webmanifest Anda bisa diletakkan di sini juga
        name: 'Dicoding Story App',
        short_name: 'StoryApp',
        description: 'Aplikasi berbagi cerita seputar Dicoding.',
        theme_color: '#2D3E50',
        background_color: '#F4F6F8',
        display: 'standalone',
        start_url: '/',
        icons: [ // Daftar ikon ditambahkan di sini
          {
            "src": "/images/appstory-72.png", // Pastikan path ini benar relatif terhadap publicDir Anda
            "sizes": "72x72",
            "type": "image/png",
            "purpose": "any maskable"
          },
          {
            "src": "/images/appstory-96.png",
            "sizes": "96x96",
            "type": "image/png",
            "purpose": "any maskable"
          },
          {
            "src": "/images/appstory-128.png",
            "sizes": "128x128",
            "type": "image/png",
            "purpose": "any maskable"
          },
          {
            "src": "/images/appstory-144.png",
            "sizes": "144x144",
            "type": "image/png",
            "purpose": "any maskable"
          },
          {
            "src": "/images/appstory-152.png",
            "sizes": "152x152",
            "type": "image/png",
            "purpose": "any maskable"
          },
          {
            "src": "/images/appstory-192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
          },
          {
            "src": "/images/appstory-384.png",
            "sizes": "384x384",
            "type": "image/png",
            "purpose": "any maskable"
          },
          {
            "src": "/images/appstory-512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
          }
        ]
      }
    })
  ]
});