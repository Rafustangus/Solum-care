import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const base = './'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/*.svg', 'assets/*.png'],
      manifest: {
        name: 'Solum-care',
        short_name: 'Solum',
        description: 'Seguimiento de curación de tatuajes para estudio y clientes.',
        lang: 'es',
        theme_color: '#EFECE6',
        background_color: '#EFECE6',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        icons: [
          {
            src: `${base}assets/icon-192.png`,
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: `${base}assets/icon-512.png`,
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: `${base}assets/icon-maskable-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        cleanupOutdatedCaches: true
      }
    })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}']
  }
})
