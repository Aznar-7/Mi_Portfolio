import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, ChevronDown, Download, Languages, Package } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { site } from '@/data/site'
import { cn } from '@/lib/utils'

function downloadFile({ url, filename }) {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

const LABELS = {
  es: { main: 'Descargar CV', done: 'Descargado', es: 'CV en español', en: 'CV en inglés', both: 'Ambos (.zip)', choose: 'Elegir idioma del CV' },
  en: { main: 'Download CV', done: 'Downloaded', es: 'Spanish CV', en: 'English CV', both: 'Both (.zip)', choose: 'Choose resume language' },
}

const ITEM = 'flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-primary)]'

export function ResumeDownloadMenu({ className = '' }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const rootRef = useRef(null)
  const timer = useRef(0)
  const { lang } = useLang()
  const { playHover, playClick, playSuccess, playSelect } = useSoundEffects()
  const L = LABELS[lang]

  useEffect(() => {
    const onPointer = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
      clearTimeout(timer.current)
    }
  }, [])

  const download = (file) => {
    downloadFile(file)
    playSuccess()
    setOpen(false)
    setDone(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setDone(false), 1800)
  }

  return (
    <div ref={rootRef} className={cn('relative inline-flex max-w-full', className)}>
      <button
        type="button"
        onClick={() => download(site.resumes[lang])}
        onMouseEnter={playHover}
        className="group flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-l-[10px] border border-r-0 border-[var(--line-strong)] px-5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-white/[0.04] active:scale-[0.98]"
      >
        <span className="relative h-4 w-4 shrink-0 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            {done ? (
              <motion.span key="done" className="absolute inset-0 text-emerald-300"
                initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 24 }}>
                <Check size={16} aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span key="idle" className="absolute inset-0 text-[var(--text-secondary)]"
                initial={{ y: -16 }} animate={{ y: 0 }} exit={{ y: 16 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <Download size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-0.5" />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="min-w-0 truncate" aria-live="polite">{done ? L.done : L.main}</span>
      </button>

      <button
        type="button"
        onClick={() => { playClick(); setOpen((v) => !v) }}
        onMouseEnter={playHover}
        aria-label={L.choose}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-11 shrink-0 items-center justify-center rounded-r-[10px] border border-[var(--line-strong)] px-3 text-[var(--text-secondary)] transition-colors hover:bg-white/[0.04] hover:text-[var(--text-primary)]"
      >
        <ChevronDown size={15} aria-hidden="true" className={cn('transition-transform duration-300', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-[13rem] origin-top-left overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--bg-elevated)] p-1.5 shadow-2xl"
          >
            {['es', 'en'].map((id) => (
              <button key={id} type="button" role="menuitem" onMouseEnter={playSelect} onClick={() => download(site.resumes[id])} className={ITEM}>
                <Languages size={14} aria-hidden="true" className="shrink-0 text-[var(--text-muted)]" />
                <span className="min-w-0 flex-1 truncate">{L[id]}</span>
                {lang === id && <Check size={13} aria-hidden="true" className="shrink-0 text-[var(--accent-hover)]" />}
              </button>
            ))}
            <div className="my-1 h-px bg-[var(--line)]" />
            <button type="button" role="menuitem" onMouseEnter={playSelect} onClick={() => download(site.resumesBundle)} className={ITEM}>
              <Package size={14} aria-hidden="true" className="shrink-0 text-[var(--text-muted)]" />
              <span className="min-w-0 truncate">{L.both}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
