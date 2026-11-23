import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'
import { projects } from './src/data/projects.js'

// index.html's crawler copy (JSON-LD and <noscript>) is written from projects.js, so it can't drift from the page
const url = (p) => (p.liveUrl?.startsWith('http') ? p.liveUrl : typeof p.githubUrl === 'string' ? p.githubUrl : p.githubUrl?.[0]?.url)
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const listed = projects.filter((p) => p.id !== 'portfolio')
const crawlerCopy = {
  name: 'crawler-copy',
  transformIndexHtml: (html) => html
    .replace('"__PROJECTS__"', JSON.stringify(listed.map((p, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'CreativeWork', name: p.title, ...(url(p) && { url: url(p) }), creator: { '@id': 'https://www.vicenteaznar.dev/#person' }, description: p.tagline.es },
    }))))
    .replace('__BUILT__', new Date().toISOString().slice(0, 10))
    .replace('<!--projects-->', listed.map((p) => `<li>${url(p) ? `<a href="${url(p)}">${esc(p.title)}</a>` : esc(p.title)}: ${esc(p.tagline.es)}</li>`).join('')),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    crawlerCopy,
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        // the page itself is precached; the eggs (three.js, the OS, html2canvas) download only for whoever
        // opens one, then stay cached. Hashed names make CacheFirst safe.
        globIgnores: ['**/{GLTFLoader,UbuntuOS,html2canvas,Hyrule,Win95,Galaxy,MiddleEarth,Order66_3D,DeLorean3D,Ships3D,OcarinaModel,RoomEnvironment,Tooltip}-*'],
        runtimeCaching: [{ urlPattern: /\/assets\/.+\.(js|css)$/, handler: 'CacheFirst', options: { cacheName: 'eggs', expiration: { maxEntries: 60 } } }],
      },
      manifest: {
        name: 'Vicente Aznar',
        short_name: 'Vicente',
        lang: 'es',
        description: 'Vicente Aznar, desarrollador full stack e IoT en Córdoba',
        theme_color: '#0e1014',
        background_color: '#0e1014',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Only pin React itself; everything else is split by Rollup so lazy
        // features (OS, html2canvas, gsap, WebGL backgrounds) stay out of the initial load
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
        },
      }
    }
  }
})
