import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'
import { projects } from './src/data/projects.js'
import { experience } from './src/data/experience.js'
import { skillGroups } from './src/data/skills.js'
import { site } from './src/data/site.js'
import { copy } from './src/i18n/site.js'

// index.html's crawler copy (JSON-LD and the pre-rendered page) is written from the site's data, so it can't drift from it
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
    .replace('<!--prerender-->', prerender()),
}

// the Spanish page in plain HTML: hero, projects, jobs, stack, contact
function prerender() {
  const es = (v) => esc(typeof v === 'string' ? v : v?.es ?? ''), C = copy.es
  const a = (href, text) => `<a href="${href}">${esc(text)}</a>`
  const links = (p) => [p.liveUrl?.startsWith('http') && a(p.liveUrl, 'Ver en vivo'), ...[].concat(p.githubUrl ?? []).map((g) => (typeof g === 'string' ? a(g, 'Código') : a(g.url, `Código · ${g.label}`)))].filter(Boolean).join(' · ')
  return `<main class="pre">
<h1>${C.hero.first} ${C.hero.last}</h1><p><strong>${es(C.hero.role)}</strong> · Córdoba, Argentina</p><p>${es(C.hero.lede)}</p>
<h2>Proyectos</h2>${listed.map((p) => `<article><h3>${esc(p.title)}</h3><p>${es(p.summary ?? p.tagline)}</p>${p.note ? `<p>${es(p.note)}</p>` : ''}<p>${links(p)}</p></article>`).join('')}
<h2>Experiencia</h2>${experience.map((e) => `<h3>${es(e.role ?? e.degree)} · ${esc(e.company ?? e.institution)}</h3><p>${es(e.period)}</p>${e.impact ? `<ul>${e.impact.es.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}`).join('')}
<h2>Stack</h2><ul>${skillGroups.map((g) => `<li>${es(g.label)}: ${g.items.map(esc).join(', ')}</li>`).join('')}</ul>
<h2>Contacto</h2><p>${es(C.contact.intro)}</p><p>${a(`mailto:${site.email}`, site.email)} · ${a(site.linkedin, 'LinkedIn')} · ${a(site.github, 'GitHub')}</p>
</main>`
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
