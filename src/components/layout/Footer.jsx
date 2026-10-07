import { TerminalSquare } from 'lucide-react'
import { site } from '@/data/site'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'

export function Footer() {
  const { lang } = useLang()
  const T = translations[lang].footer
  const H = translations[lang].hero

  return (
    <footer className="relative z-10 border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--text-muted)] sm:px-6">
        <p>© {new Date().getFullYear()} {site.name}. {T.rights}</p>
        <button
          type="button"
          onClick={() => document.dispatchEvent(new CustomEvent('open-ubuntu'))}
          title={H.open_os_hint}
          className="inline-flex items-center gap-2 transition-colors hover:text-[var(--text-primary)]"
        >
          <TerminalSquare size={15} aria-hidden="true" />
          {H.open_os}
          <kbd className="hidden rounded border border-[var(--line)] px-1.5 py-0.5 font-mono text-[11px] sm:inline">Ctrl Alt T</kbd>
        </button>
      </div>
    </footer>
  )
}
