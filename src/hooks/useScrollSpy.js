import { useState, useEffect } from 'react'

// Scroll-position based (not IntersectionObserver) so sections that mount
// later via React.lazy are picked up without re-registering observers.
export function useScrollSpy(sectionIds, offset = 120) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let current = null
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top - offset <= 0) current = id
      }
      setActiveId(current)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [sectionIds, offset])

  return activeId
}
