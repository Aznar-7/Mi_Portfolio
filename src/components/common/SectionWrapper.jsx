import { cn } from '@/lib/utils'

// Shared section frame: max width, gutters, vertical rhythm and a hairline
// rule marking the section boundary. Deliberately static: motion on this
// page is reserved for the intro and for responses to user actions.
export function SectionWrapper({ id, children, className }) {
  return (
    <section
      id={id}
      className={cn('relative z-10 mx-auto max-w-6xl scroll-mt-16 px-5 py-20 sm:px-6 sm:py-24 lg:py-32', className)}
    >
      <div aria-hidden="true" className="absolute inset-x-5 top-0 h-px bg-[var(--line)] sm:inset-x-6" />
      {children}
    </section>
  )
}
