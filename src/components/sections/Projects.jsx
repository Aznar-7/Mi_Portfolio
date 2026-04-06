import { motion } from 'motion/react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ProjectCard } from '@/components/common/ProjectCard'
import { projects } from '@/data/projects'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}

export function Projects() {
  const reduced = useReducedMotion()
  const nonFeatured = projects.filter((p) => !p.featured)

  return (
    <SectionWrapper id="projects">
      <SectionHeading
        label="// 03 — Proyectos"
        title="Otros proyectos"
        subtitle="Selección de trabajo personal y exploratorio."
      />

      <motion.div
        variants={reduced ? {} : gridVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {nonFeatured.map((project) => (
          <motion.div key={project.id} variants={reduced ? {} : cardVariants}>
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  )
}
