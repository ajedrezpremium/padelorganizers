import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'images/banner-email.jpg'],
      manifest: {
        name: 'PADELORGANIZERS',
        short_name: 'PadelOrg',
        description: 'La plataforma pro de torneos de pádel: torneos con IA, CourtManager, marcador en vivo, directorio de clubes y reservas.',
        theme_color: '#10b981',
        background_color: '#0a0f0c',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'es',
        categories: ['sports', 'productivity'],
        icons: [
          { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ],
        shortcuts: [
          { name: 'Busco cuarto', short_name: 'Match', description: 'Encuentra pareja para jugar ahora', url: '/match', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Reservar pista', short_name: 'Reservar', description: 'Reserva tu pista en segundos', url: '/club', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Directorio clubes', short_name: 'Clubes', description: 'Encuentra dónde jugar cerca de ti', url: '/clubes', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/, handler: 'StaleWhileRevalidate', options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/, handler: 'CacheFirst', options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
          { urlPattern: /^https:\/\/.*\.supabase\.co\/.*/, handler: 'NetworkFirst', options: { cacheName: 'supabase-api', networkTimeoutSeconds: 10, expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 } } }
        ]
      },
      devOptions: { enabled: true }
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/leaflet')) {
            return 'leaflet';
          }
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
