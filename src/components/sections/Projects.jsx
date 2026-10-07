import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ProjectCard } from '@/components/common/ProjectCard'
import { ProjectModal } from '@/components/common/ProjectModal'
import { projects } from '@/data/projects'
import { projectCategories } from '@/data/projectCategories'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn, l } from '@/lib/utils'

// The featured project has its own section above; it is not repeated here.
const listed = projects.filter((p) => !p.featured)

function CategoryFilter({ active, onSelect, T, lang }) {
  const options = [{ id: 'all', label: T.all }, ...projectCategories.map((c) => ({ id: c.id, label: l(c.label, lang) }))]

  return (
    <div role="group" aria-label="Filtrar proyectos" className="flex flex-wrap gap-1 rounded-xl border border-[var(--line)] p-1">
      {options.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          aria-pressed={active === id}
          className={cn(
            'relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200',
            active === id ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
          )}
        >
          {active === id && (
            <motion.span
              layoutId="project-filter"
              className="absolute inset-0 -z-10 rounded-lg bg-white/[0.07]"
              transition={{ type: 'spring', stiffness: 400, damping: 34 }}
            />
          )}
          {label}
        </button>
      ))}
    </div>
  )
}

export function Projects() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].projects
  const { playModalOpen, playModalClose, playSelect } = useSoundEffects()
  const [selected, setSelected] = useState(null)
  const [category, setCategory] = useState('all')

  const visible = listed.filter((p) => category === 'all' || p.category === category)

  return (
    <>
      <SectionWrapper id="projects">
        <SectionHeading title={T.title} subtitle={T.subtitle}>
          <CategoryFilter
            active={category}
            onSelect={(id) => { if (id !== category) { playSelect(); setCategory(id) } }}
            T={T}
            lang={lang}
          />
        </SectionHeading>

        <motion.ul layout={!reduced} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project) => {
              const wide = project.highlight
              return (
                <motion.li
                  layout={!reduced}
                  key={project.id}
                  className={wide ? 'md:col-span-2' : undefined}
                  initial={reduced ? false : { opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProjectCard
                    project={project}
                    lang={lang}
                    T={T}
                    wide={wide}
                    onOpen={() => { playModalOpen(); setSelected(project) }}
                  />
                </motion.li>
              )
            })}
          </AnimatePresence>
        </motion.ul>
      </SectionWrapper>

      <AnimatePresence>
        {selected && (
          <ProjectModal
            key={selected.id}
            project={selected}
            lang={lang}
            T={T}
            onClose={() => { playModalClose(); setSelected(null) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
