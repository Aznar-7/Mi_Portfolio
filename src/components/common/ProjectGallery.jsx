import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSoundEffects } from '@/contexts/SoundContext'
import { cn } from '@/lib/utils'

const SWIPE_PX = 60

/**
 * Controlled image carousel. Images are letterboxed (object-contain) over a
 * blurred copy of themselves, so portrait phone screenshots and landscape
 * photos both display uncropped.
 */
export function ProjectGallery({ images, index, onChange, title, T, reduced }) {
  const { playCarousel } = useSoundEffects()
  const count = images.length
  const go = (i) => {
    const next = Math.min(count - 1, Math.max(0, i))
    if (next !== index) { playCarousel(); onChange(next) }
  }

  if (!count) return null
  const src = images[index]

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={src}
            className="absolute inset-0"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3 }}
            drag={count > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_PX) go(index + 1)
              else if (info.offset.x > SWIPE_PX) go(index - 1)
            }}
          >
            <img src={src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
            <img
              src={src}
              alt={`${title}, ${index + 1} / ${count}`}
              draggable="false"
              className="relative h-full w-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            {[
              { dir: -1, Icon: ChevronLeft, label: T.prev, side: 'left-3', disabled: index === 0 },
              { dir: 1, Icon: ChevronRight, label: T.next, side: 'right-3', disabled: index === count - 1 },
            ].map(({ dir, Icon, label, side, disabled }) => (
              <button
                key={dir}
                type="button"
                onClick={() => go(index + dir)}
                disabled={disabled}
                aria-label={label}
                className={cn(
                  'absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-opacity hover:bg-black/70 disabled:opacity-0 sm:flex',
                  side,
                )}
              >
                <Icon size={18} aria-hidden="true" />
              </button>
            ))}
            <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs tabular-nums text-white/80 backdrop-blur-md">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b border-[var(--line)] px-6 py-3 [scrollbar-width:none] sm:px-8">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => go(i)}
              aria-label={`${T.slide} ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              className={cn(
                'h-12 w-16 shrink-0 overflow-hidden rounded-md border transition-[opacity,border-color] duration-200',
                i === index ? 'border-[var(--text-primary)] opacity-100' : 'border-transparent opacity-45 hover:opacity-80',
              )}
            >
              <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
