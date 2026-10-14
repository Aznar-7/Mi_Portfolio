import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { ExternalLink, Images } from 'lucide-react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { TechTag } from '@/components/common/TechTag'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/common/Button'
import { ProgressiveImage } from '@/components/common/ProgressiveImage'
import { ProjectModal } from '@/components/common/ProjectModal'
import { ArchitectureFlow } from '@/components/common/ArchitectureFlow'
import { featuredProject as project } from '@/data/projects'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { translations } from '@/i18n/translations'
import { l } from '@/lib/utils'

export function FeaturedProject() {
  const { lang } = useLang()
  const T = translations[lang].featured
  const TP = translations[lang].projects
  const { playModalOpen, playModalClose } = useSoundEffects()
  // null = closed, otherwise the gallery index to open on
  const [galleryAt, setGalleryAt] = useState(null)
  const openGallery = (i = 0) => { playModalOpen(); setGalleryAt(i) }
  // Screens shown under the cover; the first gallery image is the cover itself
  const strip = project.gallery.slice(1, 4)
  const host = project.liveUrl?.replace(/^https?:\/\//, '')

  return (
    <SectionWrapper id="featured">
      <SectionHeading title={project.title} subtitle={l(project.tagline, lang)}>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => openGallery()}>
            <Images size={16} aria-hidden="true" />
            {TP.view_details}
          </Button>
          {project.liveUrl && (
            <Button variant="primary" href={project.liveUrl}>
              {T.view}
              <ExternalLink size={15} aria-hidden="true" />
            </Button>
          )}
        </div>
      </SectionHeading>

      <button
        type="button"
        onClick={() => openGallery()}
        aria-label={`${project.title}: ${TP.view_details}`}
        className="group relative block w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-surface)]"
      >
        <ProgressiveImage
          src={project.image}
          alt=""
          wrapperClassName="aspect-[16/9] w-full"
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.015]"
        />
        {project.liveUrl && (
          <span className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 font-mono text-xs text-white/80 backdrop-blur-md">
            {host}
          </span>
        )}
      </button>

      {strip.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3">
          {strip.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => openGallery(i + 1)}
                aria-label={`${project.title}: ${TP.view_details} ${i + 2}`}
                className="group block w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--line-strong)]"
              >
                <ProgressiveImage
                  src={src}
                  alt=""
                  wrapperClassName="aspect-[16/10] w-full"
                  className="h-full w-full object-cover object-top transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <p className="max-w-prose text-[17px] leading-relaxed text-[var(--text-secondary)]">
          {l(project.description, lang)}
        </p>
        <dl className="divide-y divide-[var(--line)] self-start border-y border-[var(--line)] text-[15px]">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[var(--text-muted)]">{T.facts.status}</dt>
            <dd><StatusBadge status={project.status} label={T.active} /></dd>
          </div>
          {host && (
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-[var(--text-muted)]">{T.facts.live}</dt>
              <dd>
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] underline decoration-[var(--line-strong)] underline-offset-4 transition-colors hover:decoration-[var(--text-primary)]">
                  {host}
                </a>
              </dd>
            </div>
          )}
          <div className="py-4">
            <dt className="sr-only">{T.facts.stack}</dt>
            <dd className="flex flex-wrap gap-1.5">
              {project.tech.map((t) => <TechTag key={t} name={t} />)}
            </dd>
          </div>
        </dl>
      </div>

      {project.flow && (
        <div className="mt-12">
          <ArchitectureFlow flow={project.flow} lang={lang} title={T.arch_label} hint={T.arch_hint} />
        </div>
      )}

      <AnimatePresence>
        {galleryAt !== null && (
          <ProjectModal
            project={project}
            lang={lang}
            T={TP}
            startIndex={galleryAt}
            onClose={() => { playModalClose(); setGalleryAt(null) }}
          />
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}
