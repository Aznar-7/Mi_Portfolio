import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Home, Star, Briefcase, Code, User, Mail, Copy, Check, Download, Languages, TerminalSquare } from 'lucide-react'
import { site } from '@/data/site'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { cn } from '@/lib/utils'

const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

function buildActions(lang, { copied, copyEmail, toggleLang }) {
  const es = lang === 'es'
  return [
    { id: 'hero',       label: es ? 'Ir al inicio' : 'Go to top',               icon: Home,      run: () => scrollToId('hero') },
    { id: 'featured',   label: es ? 'Proyecto principal' : 'Featured project',  icon: Star,      run: () => scrollToId('featured') },
    { id: 'experience', label: es ? 'Experiencia' : 'Experience',               icon: Briefcase, run: () => scrollToId('experience') },
    { id: 'projects',   label: es ? 'Proyectos' : 'Projects',                   icon: Code,      run: () => scrollToId('projects') },
    { id: 'about',      label: es ? 'Sobre mí' : 'About',                       icon: User,      run: () => scrollToId('about') },
    { id: 'contact',    label: es ? 'Contacto' : 'Contact',                     icon: Mail,      run: () => scrollToId('contact') },
    { id: 'copy-email', label: copied ? (es ? 'Email copiado' : 'Email copied') : (es ? 'Copiar email' : 'Copy email'), icon: copied ? Check : Copy, run: copyEmail, keepOpen: true },
    { id: 'cv',         label: es ? 'Descargar CV' : 'Download CV',             icon: Download,  href: site.resumes[lang].url, download: site.resumes[lang].filename },
    { id: 'lang',       label: es ? 'Switch to English' : 'Cambiar a español',  icon: Languages, run: toggleLang },
    { id: 'os',         label: es ? 'Abrir el OS' : 'Open the OS',              icon: TerminalSquare, run: () => document.dispatchEvent(new CustomEvent('open-ubuntu')) },
  ]
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const { playTyping, playModalOpen, playModalClose, playSuccess, playNavigation } = useSoundEffects()
  const { lang, toggle } = useLang()
  const inputRef = useRef(null)

  const open = () => { setQuery(''); setActive(0); setIsOpen(true); playModalOpen() }
  const close = () => { setIsOpen(false); playModalClose() }

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) close(); else open()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(site.email) } catch { return }
    playSuccess()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const actions = buildActions(lang, { copied, copyEmail, toggleLang: toggle })
  const results = actions.filter((a) => a.label.toLowerCase().includes(query.trim().toLowerCase()))

  const run = (action) => {
    if (!action) return
    if (action.href) {
      const a = document.createElement('a')
      a.href = action.href
      a.download = action.download
      a.click()
    } else {
      action.run()
    }
    if (action.id !== 'copy-email') playNavigation()
    if (!action.keepOpen) setIsOpen(false)
  }

  const onInputKey = (e) => {
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % Math.max(results.length, 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + results.length) % Math.max(results.length, 1)) }
    else if (e.key === 'Enter') run(results[active])
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 px-4 pt-[15vh] backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'es' ? 'Paleta de comandos' : 'Command palette'}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onAnimationStart={() => inputRef.current?.focus()}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-[var(--bg-elevated)] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
              <Search size={16} aria-hidden="true" className="text-[var(--text-muted)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { playTyping(); setQuery(e.target.value); setActive(0) }}
                onKeyDown={onInputKey}
                placeholder={lang === 'es' ? 'Buscar una sección o acción' : 'Search a section or action'}
                aria-controls="command-results"
                aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
                className="flex-1 bg-transparent py-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <kbd className="rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-muted)]">Esc</kbd>
            </div>

            <ul id="command-results" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <li className="p-4 text-center text-sm text-[var(--text-muted)]">
                  {lang === 'es' ? 'Nada coincide con esa búsqueda.' : 'Nothing matches that search.'}
                </li>
              ) : (
                results.map((action, i) => (
                  <li
                    key={action.id}
                    id={`cmd-${action.id}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseMove={() => setActive(i)}
                    onClick={() => run(action)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      i === active ? 'bg-white/[0.06] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
                    )}
                  >
                    <action.icon size={16} aria-hidden="true" className="text-[var(--text-muted)]" />
                    {action.label}
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
