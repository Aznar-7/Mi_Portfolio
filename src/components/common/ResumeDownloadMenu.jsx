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
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => download(lang)}
        className="group flex flex-1 items-center justify-center gap-2 rounded-l-xl border border-r-0 border-white/10 bg-white/[0.06] px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.1] active:translate-y-0"
      >
        <Download size={16} className="text-white/65 transition-colors group-hover:text-white" />
        {labels.main}
        <span className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[9px] uppercase text-white/50">
          {lang}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={lang === 'es' ? 'Elegir idioma del CV' : 'Choose resume language'}
        aria-expanded={open}
        className="flex items-center justify-center rounded-r-xl border border-white/10 bg-white/[0.06] px-3 text-white/65 backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.1] hover:text-white active:translate-y-0"
      >
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-full overflow-hidden rounded-xl border border-white/10 bg-[#11121a]/95 p-1.5 shadow-2xl backdrop-blur-xl">
          {[
            { id: 'es', label: labels.es },
            { id: 'en', label: labels.en },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => download(option.id)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Languages size={14} className="text-[var(--accent-hover)]" />
              <span className="flex-1 whitespace-nowrap">{option.label}</span>
              {lang === option.id && <Check size={13} className="text-emerald-400" />}
            </button>
          ))}
          <div className="my-1 h-px bg-white/[0.07]" />
          <button
            type="button"
            onClick={downloadBoth}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Download size={14} className="text-[var(--accent-hover)]" />
            <span className="whitespace-nowrap">{labels.both}</span>
          </button>
        </div>
      )}
    </div>
  )
}
