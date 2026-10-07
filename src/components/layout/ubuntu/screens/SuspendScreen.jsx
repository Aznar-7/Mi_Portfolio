import { useEffect } from 'react';
import { motion } from 'motion/react';

export function SuspendScreen({ onWake }) {
  useEffect(() => {
    const handler = () => onWake()
    window.addEventListener('keydown',    handler)
    window.addEventListener('pointerdown', handler)
    return () => {
      window.removeEventListener('keydown',    handler)
      window.removeEventListener('pointerdown', handler)
    }
  }, [onWake])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-[5000] flex flex-col items-center justify-center bg-black"
    >
      {/* Breathing dot */}
      <motion.div
        className="mb-6 h-2 w-2 rounded-full bg-white/30"
        animate={{ opacity: [0.15, 0.5, 0.15] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <p className="font-mono text-[11px] tracking-[0.35em] text-white/20 uppercase">
        Suspendido
      </p>
      <p className="mt-3 font-mono text-[9px] tracking-[0.2em] text-white/10 uppercase">
        Presione cualquier tecla para despertar
      </p>
    </motion.div>
  )
}
