// Section header: title, optional subtitle, and an optional silkscreen
// annotation that must carry real data (a count, a date, a status), never a label.
export function SectionHeading({ title, subtitle, annotation, children }) {
  return (
    <header className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <h2 className="font-wide text-[clamp(1.9rem,4.2vw,3rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--text-primary)]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-[17px]">
            {subtitle}
          </p>
        )}
      </div>
      {annotation && <p className="silkscreen md:pb-1.5 md:text-right">{annotation}</p>}
      {children}
    </header>
  )
}
