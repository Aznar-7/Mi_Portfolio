import { motion } from 'motion/react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ProjectCard } from '@/components/common/ProjectCard'
import { projects } from '@/data/projects'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

export function Projects() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].projects
  const nonFeatured = projects.filter((p) => !p.featured)

  return (
    <SectionWrapper id="projects">
      <SectionHeading label={T.label} title={T.title} subtitle={T.subtitle} />

      <motion.div
        variants={reduced ? {} : gridVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid gap-5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}
      >
        {nonFeatured.map((project) => (
          <motion.div key={project.id} variants={reduced ? {} : cardVariants}>
            <ProjectCard project={project} lang={lang} T={T} />
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  )
}
