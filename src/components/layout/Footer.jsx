import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Terminal } from '@/components/layout/Terminal'
import { GitHubIcon, LinkedInIcon } from '@/components/common/SocialIcons'
import { MagneticButton } from '@/components/common/MagneticButton'
import { site } from '@/data/site'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'

export function Footer() {
  const [terminalOpen, setTerminalOpen] = useState(false)
  const { lang } = useLang()
  const T = translations[lang].footer

  return (
    <>
      <AnimatePresence>
        {terminalOpen && <Terminal onClose={() => setTerminalOpen(false)} />}
      </AnimatePresence>

      <footer className="relative z-10 border-t border-white/[0.05] px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          {/* Copyright */}
          <p className="font-mono text-[12px] text-[var(--text-muted)]">
            © {new Date().getFullYear()} {site.name} — {T.rights}
          </p>

          <div className="flex items-center gap-5">
            {/* Social links with magnetic effect */}
            <MagneticButton strength={0.4} radius={60}>
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                aria-label="GitHub"
              >
                <GitHubIcon size={18} />
              </a>
            </MagneticButton>

            <MagneticButton strength={0.4} radius={60}>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                aria-label="LinkedIn"
              >
                <LinkedInIcon size={18} />
              </a>
            </MagneticButton>

            {/* Terminal easter egg */}
            <MagneticButton strength={0.3} radius={80}>
              <button
                onClick={() => setTerminalOpen(true)}
                className="rounded-md border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/5 hover:text-[var(--accent)]"
              >
                [ root@aznar-dev:~ ]
              </button>
            </MagneticButton>
          </div>
        </div>
      </footer>
    </>
  )
}
