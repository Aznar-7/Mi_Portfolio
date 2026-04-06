import { GitHubIcon, LinkedInIcon } from '@/components/common/SocialIcons'
import { site } from '@/data/site'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'

export function Footer() {
  const { lang } = useLang()
  const T = translations[lang].footer

  return (
    <footer
      className="relative z-10 border-t border-white/[0.05] px-6 py-8"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-[12px] text-[var(--text-muted)]">
          © {new Date().getFullYear()} {site.name} — {T.rights}
        </p>

        <div className="flex gap-5">
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            aria-label="GitHub"
          >
            <GitHubIcon size={18} />
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            aria-label="LinkedIn"
          >
            <LinkedInIcon size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}
