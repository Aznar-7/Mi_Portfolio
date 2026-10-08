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
  const [galleryOpen, setGalleryOpen] = useState(false)

  const openGallery = () => { playModalOpen(); setGalleryOpen(true) }

  return (
    <SectionWrapper id="featured">
      <SectionHeading label={T.label} title={project.title} subtitle={l(project.tagline, lang)}>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openGallery}>
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
        onClick={openGallery}
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
            {project.liveUrl.replace(/^https?:\/\//, '')}
          </span>
        )}
      </button>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <div>
          <StatusBadge status={project.status} label={T.active} />
          <p className="mt-4 max-w-prose text-[17px] leading-relaxed text-[var(--text-secondary)]">
            {l(project.description, lang)}
          </p>
        </div>
        <div className="flex flex-wrap content-start gap-1.5 lg:pt-9">
          {project.tech.map((t) => <TechTag key={t} name={t} />)}
        </div>
      </div>

      {project.flow && (
        <div className="mt-12">
          <ArchitectureFlow flow={project.flow} lang={lang} title={T.arch_label} hint={T.arch_hint} />
        </div>
      )}

      <AnimatePresence>
        {galleryOpen && (
          <ProjectModal
            project={project}
            lang={lang}
            T={TP}
            onClose={() => { playModalClose(); setGalleryOpen(false) }}
          />
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}
