import { useRef } from 'react'
import { ArrowUpRight, Mail } from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from '@/components/common/SocialIcons'
import { SectionWrapper, TraceSegment } from '@/components/common/SectionWrapper'
import { CopyButton } from '@/components/common/CopyButton'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { site } from '@/data/site'

const LINKS = [
  { href: site.github, label: 'GitHub', Icon: GitHubIcon },
  { href: site.linkedin, label: 'LinkedIn', Icon: LinkedInIcon },
]

export function Contact() {
  const { lang } = useLang()
  const T = translations[lang].contact
  const padRef = useRef(null)

  return (
    <SectionWrapper id="contact" trace={false}>
      {/* The margin trace ends here: it bends onto the email pad */}
      <div ref={padRef} className="relative">
        <TraceSegment targetRef={padRef} className="-left-12 -top-32 bottom-8" terminal />
        <h2 className="font-wide max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--text-primary)]">
          {T.title}
        </h2>
        <p className="mt-6 max-w-md text-lg text-[var(--text-secondary)]">{T.subtitle}</p>

        <div className="mt-14 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${site.email}`}
            className="group inline-flex min-h-16 items-center gap-3 rounded-[2px] bg-[var(--accent)] px-6 py-3 font-wide text-[clamp(0.95rem,2.4vw,1.5rem)] font-semibold tracking-[-0.01em] text-[var(--bg-base)] transition-colors duration-200 hover:bg-[var(--accent-hover)] active:scale-[0.99]"
          >
            <Mail size={20} aria-hidden="true" className="shrink-0" />
            <span className="break-all">{site.email}</span>
          </a>
          <CopyButton value={site.email} label={T.copy} copiedLabel={T.copied} />
        </div>
      </div>

      <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--line)] pt-8">
        {LINKS.map(({ href, label, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-11 items-center gap-2 text-[15px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              <Icon size={16} />
              {label}
              <ArrowUpRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </li>
        ))}
      </ul>
    </SectionWrapper>
  )
}
