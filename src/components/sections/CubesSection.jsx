import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Cubes from '../background/Cubes'
import { ParticleField } from '../common/ParticleField'
import { WaveField }     from '../common/WaveField'
import { PhysicsField }  from '../common/PhysicsField'
import { SectionWrapper } from '../common/SectionWrapper'
import { SectionHeading } from '../common/SectionHeading'
import { useLang } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSoundEffects } from '@/contexts/SoundContext'

/* ── Cube presets ─────────────────────────────────────────── */
const PRESETS = {
  calm:  { gridSize: 7,  maxAngle: 28, radius: 2.5, borderStyle: '1px solid rgba(177,158,239,0.22)', faceColor: '#0c0a1e', rippleColor: '#8b5cf6', rippleSpeed: 0.9 },
  chaos: { gridSize: 11, maxAngle: 65, radius: 4.5, borderStyle: '1px solid rgba(239,68,68,0.28)',  faceColor: '#150505', rippleColor: '#ef4444', rippleSpeed: 3.5 },
  neon:  { gridSize: 8,  maxAngle: 45, radius: 3,   borderStyle: '1px solid rgba(0,255,200,0.22)',  faceColor: '#020e0b', rippleColor: '#00ffd0', rippleSpeed: 2.2 },
}
const PRESET_META = {
  calm:  { icon: '◎', accent: 'rgba(139,92,246,0.7)'  },
  chaos: { icon: '✦', accent: 'rgba(239,68,68,0.7)'   },
  neon:  { icon: '◈', accent: 'rgba(0,255,200,0.7)'   },
}

/* ── View definitions ─────────────────────────────────────── */
const VIEWS = [
  { key: 'cubes',     iconChar: '▦', labelEs: 'Cubos',      labelEn: 'Cubes',     accent: 'rgba(139,92,246,0.7)',  glow: 'var(--accent)'          },
  { key: 'particles', iconChar: '∷', labelEs: 'Partículas', labelEn: 'Particles', accent: 'rgba(96,165,250,0.7)',  glow: 'rgba(96,165,250,1)'     },
  { key: 'waves',     iconChar: '≋', labelEs: 'Ondas',      labelEn: 'Waves',     accent: 'rgba(52,211,153,0.7)',  glow: 'rgba(52,211,153,1)'     },
  { key: 'physics',   iconChar: '⊙', labelEs: 'Física',     labelEn: 'Physics',   accent: 'rgba(251,146,60,0.7)',  glow: 'rgba(251,146,60,1)'     },
]

const HINTS = {
  es: {
    cubes:     'Mover cursor · Click para onda',
    particles: 'Cursor atrae · Click para explotar',
    waves:     'Mover cursor · Click para splash',
    physics:   'Cursor repele · Click para más pelotas',
  },
  en: {
    cubes:     'Move cursor · Click for ripple',
    particles: 'Cursor attracts · Click to explode',
    waves:     'Move cursor · Click for splash',
    physics:   'Cursor repels · Click for more balls',
  },
}

export const CubesSection = () => {
  const reduced  = useReducedMotion()
  const { lang } = useLang()
  const T        = translations[lang].interact
  const { playSwipe, playSelect } = useSoundEffects()
  const [view,   setView]   = useState('cubes')
  const [preset, setPreset] = useState('calm')

  const activeView = VIEWS.find(v => v.key === view)

  return (
    <SectionWrapper id="interact" className="overflow-hidden">
      <SectionHeading title={T.title} subtitle={T.subtitle} />

      {/* ── Top controls row ── */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Main view tabs — scrollable on mobile */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.02] p-1.5 scrollbar-none">
          {VIEWS.map(v => {
            const isActive = view === v.key
            const label    = lang === 'es' ? v.labelEs : v.labelEn
            return (
              <button
                key={v.key}
                onClick={() => { if (view !== v.key) { playSwipe(); setView(v.key) } }}
                className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 font-mono text-[10px] font-semibold tracking-widest uppercase transition-all duration-250"
                style={{
                  color:      isActive ? '#fff' : 'var(--text-muted)',
                  background: isActive ? v.accent.replace('0.7)', '0.16)') : 'transparent',
                  border:     isActive ? `1px solid ${v.accent.replace('0.7)', '0.28)')}` : '1px solid transparent',
                  textShadow: isActive ? `0 0 18px ${v.accent}` : 'none',
                }}
              >
                <span style={{ filter: isActive ? `drop-shadow(0 0 5px ${v.accent})` : 'none' }}>
                  {v.iconChar}
                </span>
                {label}
              </button>
            )
          })}
        </div>

        {/* Preset selector — cubes only */}
        <AnimatePresence>
          {view === 'cubes' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--text-muted)] uppercase">
                {T.mode_label}
              </span>
              <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.015] p-1">
                {Object.keys(PRESETS).map(key => {
                  const isActive = preset === key
                  return (
                    <button
                      key={key}
                      onClick={() => { if (preset !== key) { playSelect(); setPreset(key) } }}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[10px] font-semibold tracking-widest uppercase transition-all duration-200"
                      style={{
                        color:      isActive ? '#fff' : 'var(--text-muted)',
                        background: isActive ? PRESET_META[key].accent.replace('0.7)', '0.18)') : 'transparent',
                        border:     isActive ? `1px solid ${PRESET_META[key].accent.replace('0.7)', '0.30)')}` : '1px solid transparent',
                      }}
                    >
                      <span style={{ filter: isActive ? `drop-shadow(0 0 4px ${PRESET_META[key].accent})` : 'none' }}>
                        {PRESET_META[key].icon}
                      </span>
                      {T.modes[key]}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Canvas area ── */}
      <div
        className="relative mx-auto"
        style={{ maxWidth: '680px', height: 'clamp(260px, 55vw, 420px)' }}
      >
        {/* Dynamic glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl blur-[70px] transition-all duration-700"
          style={{
            background: `radial-gradient(ellipse at center, ${
              view === 'cubes' ? PRESET_META[preset].accent.replace('0.7)', '0.12)') :
              activeView.accent.replace('0.7)', '0.10)')
            } 0%, transparent 70%)`,
          }}
        />

        <AnimatePresence mode="wait">
          {view === 'cubes' && (
            <motion.div
              key={`cubes-${preset}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.28 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Cubes
                {...PRESETS[preset]}
                autoAnimate={!reduced}
                rippleOnClick
              />
            </motion.div>
          )}

          {view === 'particles' && (
            <motion.div
              key="particles"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <ParticleField />
            </motion.div>
          )}

          {view === 'waves' && (
            <motion.div
              key="waves"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <WaveField />
            </motion.div>
          )}

          {view === 'physics' && (
            <motion.div
              key="physics"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <PhysicsField />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contextual hint */}
      <p className="mt-5 text-center font-mono text-[10px] tracking-[0.15em] text-[var(--text-muted)] uppercase">
        {HINTS[lang][view]}
      </p>
    </SectionWrapper>
  )
}
