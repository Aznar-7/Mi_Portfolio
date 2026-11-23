import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { VitePWA } from 'vite-plugin-pwa'
import { projects } from './src/data/projects.js'
import { experience, academic } from './src/data/experience.js'
import { skillGroups } from './src/data/skills.js'
import { site } from './src/data/site.js'
import { copy } from './src/i18n/site.js'

// index.html's crawler copy (JSON-LD and the pre-rendered page) is written from the site's data, so it can't drift
// from it. The build also writes /en/: the same page with English meta and English pre-rendered content.
const SITE = 'https://www.vicenteaznar.dev'
const url = (p) => (p.liveUrl?.startsWith('http') ? p.liveUrl : typeof p.githubUrl === 'string' ? p.githubUrl : p.githubUrl?.[0]?.url)
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const listed = projects.filter((p) => p.id !== 'portfolio')
const crawlerCopy = {
  name: 'crawler-copy',
  transformIndexHtml: (html) => html
    .replace('"__PROJECTS__"', JSON.stringify(listed.map((p, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'CreativeWork', name: p.title, ...(url(p) && { url: url(p) }), creator: { '@id': `${SITE}/#person` }, description: p.tagline.es },
    }))))
    .replace('__BUILT__', new Date().toISOString().slice(0, 10))
    .replace('<!--prerender-->', prerender('es')),
  // once the Spanish page is written, /en/ is made from it
  writeBundle({ dir }) {
    mkdirSync(`${dir}/en`, { recursive: true })
    writeFileSync(`${dir}/en/index.html`, english(readFileSync(`${dir}/index.html`, 'utf8')))
  },
}

// the page in plain HTML: hero, projects, jobs, education, stack, contact
const WORDS = {
  es: { live: 'Ver en vivo', code: 'Código', projects: 'Proyectos', work: 'Experiencia', edu: 'Formación', contact: 'Contacto' },
  en: { live: 'See it live', code: 'Code', projects: 'Projects', work: 'Experience', edu: 'Education', contact: 'Contact' },
}
function prerender(lang) {
  const t = (v) => esc(typeof v === 'string' ? v : v?.[lang] ?? ''), C = copy[lang], W = WORDS[lang]
  const a = (href, text) => `<a href="${href}">${esc(text)}</a>`
  const list = (x) => (x?.[lang]?.length ? `<ul>${x[lang].map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '')
  const links = (p) => [p.liveUrl?.startsWith('http') && a(p.liveUrl, W.live), ...[].concat(p.githubUrl ?? []).map((g) => (typeof g === 'string' ? a(g, W.code) : a(g.url, `${W.code} · ${g.label}`)))].filter(Boolean).join(' · ')
  return `<main class="pre">
<h1>${C.hero.first} ${C.hero.last}</h1><p><strong>${t(C.hero.role)}</strong> · Córdoba, Argentina</p><p>${t(C.hero.lede)}</p>
<h2>${W.projects}</h2>${listed.map((p) => `<article><h3>${esc(p.title)}</h3><p>${t(p.summary ?? p.tagline)}</p>${p.note ? `<p>${t(p.note)}</p>` : ''}<p>${links(p)}</p></article>`).join('')}
<h2>${W.work}</h2>${experience.map((e) => `<h3>${t(e.role)} · ${esc(e.company)}</h3><p>${t(e.period)}</p>${list(e.impact)}`).join('')}
<h2>${W.edu}</h2>${academic.map((e) => `<h3>${t(e.degree)} · ${esc(e.institution)}</h3><p>${t(e.period)}</p>${list(e.highlights)}`).join('')}
<h2>Stack</h2><ul>${skillGroups.map((g) => `<li>${t(g.label)}: ${g.items.map(esc).join(', ')}</li>`).join('')}</ul>
<h2>${W.contact}</h2><p>${t(C.contact.intro)}</p><p>${a(`mailto:${site.email}`, site.email)} · ${a(site.linkedin, 'LinkedIn')} · ${a(site.github, 'GitHub')}</p>
</main>`
}

// the Spanish build output turned English: every swap must hit, so a changed tag in index.html fails the build
// instead of shipping a half-translated /en/
function english(html) {
  const swaps = [
    ['<html lang="es">', '<html lang="en">'],
    [/<title>[^<]*<\/title>/, '<title>Vicente Aznar · Full Stack and IoT Developer, Córdoba</title>'],
    [/(<meta name="description" content=")[^"]*/, '$1Full stack developer in Córdoba, Argentina: React and Django systems in production on my own Linux servers, and hardware with ESP32 and Raspberry Pi. Co-founder of Gavia.'],
    [/(<meta property="og:(?:title)" content=")[^"]*/, '$1Vicente Aznar · Full stack and IoT developer in Córdoba'],
    [/(<meta name="twitter:title" content=")[^"]*/, '$1Vicente Aznar · Full stack and IoT developer in Córdoba'],
    [/(<meta (?:property="og|name="twitter):description" content=")[^"]*/g, '$1Web systems in production and hardware that works: React, Django, ESP32, Raspberry Pi. Córdoba, Argentina.'],
    [/(<meta (?:property="og|name="twitter):image:alt" content=")[^"]*/g, '$1Vicente Aznar, full stack and IoT developer, Córdoba, Argentina'],
    [`<link rel="canonical" href="${SITE}/" />`, `<link rel="canonical" href="${SITE}/en/" />`],
    [`<meta property="og:url" content="${SITE}/" />`, `<meta property="og:url" content="${SITE}/en/" />`],
    ['og:locale" content="es_AR"', 'og:locale" content="en_US"'],
    ['og:locale:alternate" content="en_US"', 'og:locale:alternate" content="es_AR"'],
    [/<main class="pre">[\s\S]*?<\/main>/, prerender('en')],
  ]
  return swaps.reduce((h, [from, to]) => {
    const next = h.replace(from, to)
    if (next === h) throw new Error(`crawler-copy: /en/ swap missed ${from}`)
    return next
  }, html)
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
