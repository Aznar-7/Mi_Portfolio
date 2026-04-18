import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Terminal } from '@/components/layout/Terminal'
import { UbuntuOS } from '@/components/layout/UbuntuOS'
import { GitHubIcon, LinkedInIcon } from '@/components/common/SocialIcons'
import { MagneticButton } from '@/components/common/MagneticButton'
import { site } from '@/data/site'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'

export function Footer() {
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [ubuntuOpen, setUbuntuOpen] = useState(false)
  const { lang } = useLang()
  const T = translations[lang].footer

  return (
    <>
      <AnimatePresence>
        {terminalOpen && <Terminal onClose={() => setTerminalOpen(false)} />}
        {ubuntuOpen && <UbuntuOS onClose={() => setUbuntuOpen(false)} />}
      </AnimatePresence>

      <footer className="relative z-10 border-t border-white/[0.05] px-5 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          {/* Copyright */}
          <p className="font-mono text-[12px] text-[var(--text-muted)]">
            © {new Date().getFullYear()} {site.name} — {T.rights}
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
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

            {/* Ubuntu easter egg */}
            <MagneticButton strength={0.3} radius={80}>
              <button
                onClick={() => setUbuntuOpen(true)}
                className="flex items-center gap-2 rounded-md border border-[#E95420]/30 bg-[#E95420]/10 px-3 py-1.5 font-mono text-[10px] sm:text-[11px] text-[#ff9066] transition-all hover:border-[#E95420]/60 hover:bg-[#E95420]/20 hover:text-white whitespace-nowrap"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12,0C5.37,0,0,5.37,0,12c0,6.63,5.37,12,12,12c6.63,0,12-5.37,12-12C24,5.37,18.63,0,12,0z M19.46,15.68 c-0.67,1.15-2.18,1.55-3.33,0.88c-1.92-1.11-4.32-1.11-6.25,0c-1.15,0.67-2.65,0.27-3.33-0.88c-0.67-1.15-0.27-2.65,0.88-3.33 c2.88-1.66,6.48-1.66,9.36,0C19.74,13.03,20.13,14.53,19.46,15.68z M12,3.31c4.8,0,8.69,3.89,8.69,8.69s-3.89,8.69-8.69,8.69 S3.31,16.8,3.31,12S7.2,3.31,12,3.31zM6.92,12c0-2.81,2.27-5.08,5.08-5.08s5.08,2.27,5.08,5.08s-2.27,5.08-5.08,5.08 S6.92,14.81,6.92,12z"/>
                </svg>
                Boot Ubuntu_OS
              </button>
            </MagneticButton>

            {/* Android OS easter egg */}
            <MagneticButton strength={0.3} radius={80}>
              <button
                onClick={() => document.dispatchEvent(new CustomEvent('open-android'))}
                className="flex items-center gap-2 rounded-md border border-[#3DDC84]/30 bg-[#3DDC84]/10 px-3 py-1.5 font-mono text-[10px] sm:text-[11px] text-[#86e8a8] transition-all hover:border-[#3DDC84]/60 hover:bg-[#3DDC84]/20 hover:text-white whitespace-nowrap"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997zm11.4045-6.0204l1.9973-3.4592a.4158.4158 0 00-.1521-.5676.4162.4162 0 00-.568.1521l-2.0218 3.503a11.1718 11.1718 0 00-5.1369-1.2464 11.1738 11.1738 0 00-5.1369 1.2464l-2.0218-3.503a.4158.4158 0 10-.7201.4155l1.9973 3.4592C2.6889 11.1633.3432 14.659.0494 18.75h23.9012c-.2938-4.091-2.6395-7.5867-6.0691-9.429z" />
                </svg>
                Boot Android_OS
              </button>
            </MagneticButton>
          </div>
        </div>
      </footer>
    </>
  )
}
