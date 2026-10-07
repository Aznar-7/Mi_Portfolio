import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Download, Languages } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { site } from '@/data/site'

function downloadResume(resume) {
  const anchor = document.createElement('a')
  anchor.href = resume.url
  anchor.download = resume.filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export function ResumeDownloadMenu({ className = '', onDownload }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const { lang } = useLang()

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const download = (language) => {
    downloadResume(site.resumes[language])
    onDownload?.()
    setOpen(false)
  }

  const downloadBoth = () => {
    downloadResume(site.resumesBundle)
    onDownload?.()
    setOpen(false)
  }

  const labels = lang === 'es'
    ? { main: 'Descargar CV', es: 'CV en español', en: 'CV en inglés', both: 'Descargar ambos' }
    : { main: 'Download CV', es: 'Spanish CV', en: 'English CV', both: 'Download both' }

  return (
    <div ref={rootRef} className={`relative inline-flex max-w-full ${className}`}>
      <button
        type="button"
        onClick={() => download(lang)}
        className="flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-l-[10px] border border-r-0 border-[var(--line-strong)] px-5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-white/[0.04]"
      >
        <Download size={16} aria-hidden="true" className="shrink-0 text-[var(--text-secondary)]" />
        <span className="min-w-0 truncate">{labels.main}</span>
      </button>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={lang === 'es' ? 'Elegir idioma del CV' : 'Choose resume language'}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-11 shrink-0 items-center justify-center rounded-r-[10px] border border-[var(--line-strong)] px-3 text-[var(--text-secondary)] transition-colors hover:bg-white/[0.04] hover:text-[var(--text-primary)]"
      >
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-[13rem] overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--bg-elevated)] p-1.5 shadow-2xl"
        >
          {[
            { id: 'es', label: labels.es },
            { id: 'en', label: labels.en },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => download(option.id)}
              role="menuitem"
              className="flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
            >
              <Languages size={14} aria-hidden="true" className="shrink-0 text-[var(--text-muted)]" />
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {lang === option.id && <Check size={13} aria-hidden="true" className="shrink-0 text-[var(--accent-hover)]" />}
            </button>
          ))}
          <div className="my-1 h-px bg-[var(--line)]" />
          <button
            type="button"
            onClick={downloadBoth}
            role="menuitem"
            className="flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
          >
            <Download size={14} aria-hidden="true" className="shrink-0 text-[var(--text-muted)]" />
            <span className="min-w-0 truncate">{labels.both}</span>
          </button>
        </div>
      )}
    </div>
  )
}
