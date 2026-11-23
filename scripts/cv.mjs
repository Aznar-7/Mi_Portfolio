// The CVs, written from the site's own data so they never fall behind it: `npm run cv`.
// One column, real text, standard headings: it reads well and parses in any applicant tracking system.
// Prints with the Edge or Chrome already installed (no browser download); CHROME_PATH overrides.
import { writeFileSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { site } from '../src/data/site.js'
import { experience, academic } from '../src/data/experience.js'
import { projects } from '../src/data/projects.js'
import { skillGroups } from '../src/data/skills.js'

const PHONE = '+54 351 259 2308'
const PICKS = ['utn-hub', 'eco-records', 'autofull', 'transportes-java'] // what fits on one page; Propier joins once it is live

const T = {
  es: {
    file: 'public/vicente_aznar_cv_espanol.pdf', role: 'Desarrollador Full Stack · React, Django e IoT',
    profile: 'Desarrollador full stack en Córdoba, Argentina. En Porta Hnos construyo sistemas internos con React, Django y PostgreSQL, apps móviles que hablan con PLCs y un buscador con RAG sobre Jira. Cofundador de Gavia, un estudio de software a medida. También construyo hardware: un tocadiscos con Raspberry Pi y NFC y un auto autónomo con ESP32.',
    h: { profile: 'Perfil', work: 'Experiencia', projects: 'Proyectos', edu: 'Formación', skills: 'Stack', langs: 'Idiomas' },
    expected: 'egreso previsto', client: 'Proyecto de cliente con Gavia',
    langs: 'Español (nativo) · Inglés (C1, certificado Cambridge) · Portugués (básico)',
  },
  en: {
    file: 'public/ResumeVicenteAznar.pdf', role: 'Full Stack Developer · React, Django and IoT',
    profile: 'Full stack developer in Córdoba, Argentina. At Porta Hnos I build internal systems with React, Django and PostgreSQL, mobile apps that talk to PLCs and a RAG search over Jira. Co-founder of Gavia, a custom software studio. I also build hardware: a Raspberry Pi record player with NFC and an autonomous ESP32 car.',
    h: { profile: 'Profile', work: 'Experience', projects: 'Projects', edu: 'Education', skills: 'Skills', langs: 'Languages' },
    expected: 'expected', client: 'Client project with Gavia',
    langs: 'Spanish (native) · English (C1, Cambridge certified) · Portuguese (basic)',
  },
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const host = (u) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

function html(lang) {
  const t = T[lang], l = (v) => esc(typeof v === 'string' ? v : v?.[lang] ?? '')
  const linkOf = (p) => (p.liveUrl?.startsWith('http') ? p.liveUrl : [].concat(p.githubUrl ?? []).map((g) => g.url ?? g)[0])
  const item = (title, sub, when, bullets = []) => `<div class="item"><div class="row"><b>${title}</b><span>${when}</span></div>${sub ? `<i>${sub}</i>` : ''}${bullets.length ? `<ul>${bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}</div>`
  return `<!doctype html><html lang="${lang}"><meta charset="utf-8"><title>Vicente Aznar · CV</title>
<style>
  @page { size: A4; margin: 12mm 14mm }
  * { box-sizing: border-box }
  body { margin: 0; font: 9.3pt/1.34 "Segoe UI", "Helvetica Neue", Arial, sans-serif; color: #1d2026 }
  h1 { margin: 0; font-size: 22pt; letter-spacing: -.01em; line-height: 1 }
  .role { margin: 4px 0 6px; font-size: 11pt; color: #9a6a2c; font-weight: 600 }
  .contact { color: #4a505c } .contact a { color: inherit; text-decoration: none } .contact span { white-space: nowrap }
  h2 { margin: 11px 0 4px; padding-bottom: 3px; border-bottom: 1.2px solid #c9a46a; font-size: 10.5pt; text-transform: uppercase; letter-spacing: .08em }
  p { margin: 0 }
  .item { margin: 0 0 6px; break-inside: avoid }
  .row { display: flex; justify-content: space-between; gap: 12px } .row span { color: #4a505c; white-space: nowrap }
  i { display: block; color: #4a505c; font-style: normal }
  ul { margin: 3px 0 0; padding-left: 15px } li { margin: 1px 0 }
  .skills { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 18px } .skills b { margin-right: 6px }
  a { color: #1d2026 }
</style>
<h1>Vicente Aznar</h1>
<p class="role">${t.role}</p>
<p class="contact">${['Córdoba, Argentina', PHONE, `<a href="mailto:${site.email}">${site.email}</a>`, `<a href="https://www.vicenteaznar.dev${lang === 'en' ? '/en/' : '/'}">vicenteaznar.dev</a>`, `<a href="${site.linkedin}">${host(site.linkedin)}</a>`, `<a href="${site.github}">${host(site.github)}</a>`].map((x) => `<span>${x}</span>`).join(' · ')}</p>
<h2>${t.h.profile}</h2><p>${esc(t.profile)}</p>
<h2>${t.h.work}</h2>${experience.map((e) => item(`${l(e.role)} · ${esc(e.company)}`, '', l(e.period), e.impact?.[lang] ?? [])).join('')}
<h2>${t.h.projects}</h2>${PICKS.map((id) => projects.find((p) => p.id === id)).map((p) => {
    const u = linkOf(p)
    return item(esc(p.title), `${l(p.tagline)} ${esc(p.tech.slice(0, 5).join(', '))}.`, u ? `<a href="${u}">${host(u)}</a>` : t.client)
  }).join('')}
<h2>${t.h.edu}</h2>${academic.map((e) => item(l(e.degree), esc(e.institution), `${l(e.period).split(' – ')[0]} – ${t.expected} ${l(e.expected)}`)).join('')}
<h2>${t.h.skills}</h2><div class="skills">${skillGroups.filter((g) => g.id !== 'other').map((g) => `<div><b>${l(g.label)}</b><span>${esc(g.items.join(', '))}</span></div>`).join('')}</div>
<h2>${t.h.langs}</h2><p>${t.langs}</p>
</html>`
}

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'msedge' })
const page = await browser.newPage()
for (const lang of ['es', 'en']) {
  await page.setContent(html(lang), { waitUntil: 'load' })
  writeFileSync(T[lang].file, await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true }))
  console.log(T[lang].file)
}
await browser.close()
