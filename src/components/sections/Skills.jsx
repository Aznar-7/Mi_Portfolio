import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SectionWrapper } from '@/components/common/SectionWrapper'
import { SectionHeading } from '@/components/common/SectionHeading'
import { skillsData, skillsCategories } from '@/data/skills'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSoundEffects } from '@/contexts/SoundContext'

const CATEGORY_EN = {
  'Todos': 'All',
  'Frontend': 'Frontend',
  'Backend': 'Backend',
  'Infraestructura': 'Infrastructure',
  'Bases de datos': 'Databases',
  'IoT & Hardware': 'IoT & Hardware',
  'Otros': 'Other'
}

export function Skills() {
  const reduced = useReducedMotion()
  const { lang } = useLang()
  const T = translations[lang].skills
  const { playSelect, playHover } = useSoundEffects()
  const [activeCategory, setActiveCategory] = useState('Frontend')

  // const filteredSkills = activeCategory === 'Todos' 
  //   ? skillsData 
  //   : skillsData.filter(skill => skill.category === activeCategory)

  const filteredSkills = skillsData.filter(skill => skill.category === activeCategory)

  return (
    <SectionWrapper id="skills">
      <SectionHeading label={T.label} title={T.title} subtitle={T.subtitle} />

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {skillsCategories.map((category) => (
          <button
            key={category}
            onClick={() => { if (activeCategory !== category) { playSelect(); setActiveCategory(category) } }}
            className={`cursor-target px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
              activeCategory === category
                ? 'bg-white/10 border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                : 'bg-transparent border-white/5 text-white/50 hover:text-white/90 hover:border-white/20 hover:bg-white/[0.03]'
            }`}
          >
            {lang === 'en' ? CATEGORY_EN[category] : category}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-5xl mx-auto min-h-[400px] items-start relative box-border"
      >
        <AnimatePresence mode="popLayout">
          {filteredSkills.map((skill) => (
            <motion.div
              layout
              initial={reduced ? false : { opacity: 0, scale: 0.5, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.5, filter: 'blur(8px)' }}
              transition={{ 
                duration: 0.4, 
                type: 'spring', 
                bounce: 0.2 
              }}
              key={skill.name}
              onMouseEnter={playHover}
              className="cursor-target group relative flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl border border-white/[0.04] bg-[#0d0d0d]/40 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-colors duration-500"
              style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.1)' }}
            >
              {/* Hover Glow Effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[24px] pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${skill.color}25 0%, transparent 80%)`
                }}
              />
              
              {/* Top gradient line on hover */}
              <div 
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${skill.color}, transparent)`
                }}
              />

              <div className="relative z-10 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 drop-shadow-lg">
                <img 
                  src={skill.icon} 
                  alt={skill.name} 
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>

              <span
                className="relative z-10 text-[11px] sm:text-sm font-semibold tracking-wide text-white/60 group-hover:text-white transition-colors duration-300"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
              >
                {skill.name}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </SectionWrapper>
  )
}