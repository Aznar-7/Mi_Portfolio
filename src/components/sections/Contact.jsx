import { ArrowUpRight } from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from '@/components/common/SocialIcons'
import { SectionWrapper } from '@/components/common/SectionWrapper'
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

  return (
    <SectionWrapper id="contact">
      <h2 className="max-w-4xl text-[clamp(2.75rem,8vw,6rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--text-primary)]">
        {T.title}
      </h2>
      <p className="mt-6 max-w-md text-lg text-[var(--text-secondary)]">{T.subtitle}</p>

      <div className="mt-14 flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${site.email}`}
          className="group mr-2 break-all text-[clamp(1.25rem,3.4vw,2rem)] font-medium tracking-[-0.02em] text-[var(--text-primary)] underline decoration-[var(--line-strong)] decoration-1 underline-offset-[0.3em] transition-[text-decoration-color] duration-300 hover:decoration-[var(--accent-hover)]"
        >
          {site.email}
        </a>
        <CopyButton value={site.email} label={T.copy} copiedLabel={T.copied} />
      </div>

      <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--line)] pt-8">
        {LINKS.map(({ href, label, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-[15px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
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
