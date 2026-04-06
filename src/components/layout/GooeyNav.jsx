import { useRef, useState, useEffect, useCallback } from 'react'
import '@/styles/GooeyNav.css'

const GooeyNav = ({ items, activeId, onItemClick, particleCount = 15, particleDistances = [90, 10], particleR = 100, initialActiveIndex = 0, animationTime = 600, timeVariance = 300 }) => {
  const containerRef = useRef(null)
  const indicatorRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex)
  const itemRefs = useRef([])
  const particleRefs = useRef([])
  const animationRef = useRef(null)

  useEffect(() => {
    if (!activeId || !items) return
    const idx = items.findIndex((item) => item.id === activeId)
    if (idx !== -1 && idx !== activeIndex) {
      moveIndicator(idx, false)
    }
  }, [activeId, items])

  const getItemPosition = useCallback((index) => {
    const el = itemRefs.current[index]
    const container = containerRef.current
    if (!el || !container) return null
    const elRect = el.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    return {
      left: elRect.left - containerRect.left,
      width: elRect.width,
      top: elRect.top - containerRect.top,
      height: elRect.height,
      centerX: elRect.left - containerRect.left + elRect.width / 2,
      centerY: elRect.top - containerRect.top + elRect.height / 2,
    }
  }, [])

  const triggerParticles = useCallback(
    (fromIndex, toIndex) => {
      const from = getItemPosition(fromIndex)
      const to = getItemPosition(toIndex)
      if (!from || !to) return

      const container = containerRef.current
      if (!container) return

      particleRefs.current.forEach((p) => {
        if (p) p.remove()
      })
      particleRefs.current = []

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div')
        particle.className = 'gooey-nav-particle'

        const size = 4 + Math.random() * 8
        const startX = from.centerX
        const startY = from.centerY
        const angle = Math.random() * Math.PI * 2
        const dist = particleDistances[0] + Math.random() * particleDistances[1]
        const endX = to.centerX + Math.cos(angle) * dist * 0.3
        const endY = to.centerY + Math.sin(angle) * dist * 0.3

        particle.style.cssText = `
          left: ${startX - size / 2}px;
          top: ${startY - size / 2}px;
          width: ${size}px;
          height: ${size}px;
          opacity: 0;
          position: absolute;
          border-radius: 50%;
          background: var(--accent);
          pointer-events: none;
          z-index: 0;
        `

        container.appendChild(particle)
        particleRefs.current.push(particle)

        const delay = Math.random() * timeVariance
        const duration = animationTime * 0.6 + Math.random() * animationTime * 0.4

        setTimeout(() => {
          particle.style.transition = `all ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
          particle.style.opacity = '0.7'
          particle.style.left = `${endX - size / 2}px`
          particle.style.top = `${endY - size / 2}px`
          setTimeout(() => {
            particle.style.opacity = '0'
            setTimeout(() => particle.remove(), duration)
          }, duration * 0.6)
        }, delay)
      }
    },
    [particleCount, particleDistances, timeVariance, animationTime, getItemPosition]
  )

  const moveIndicator = useCallback(
    (index, animate = true) => {
      const pos = getItemPosition(index)
      const indicator = indicatorRef.current
      if (!pos || !indicator) return

      if (!animate) {
        indicator.style.transition = 'none'
        indicator.style.left = `${pos.left}px`
        indicator.style.width = `${pos.width}px`
        indicator.style.top = `${pos.top}px`
        indicator.style.height = `${pos.height}px`
        setTimeout(() => {
          indicator.style.transition = ''
        }, 50)
      } else {
        indicator.style.left = `${pos.left}px`
        indicator.style.width = `${pos.width}px`
        indicator.style.top = `${pos.top}px`
        indicator.style.height = `${pos.height}px`
      }
      setActiveIndex(index)
    },
    [getItemPosition]
  )

  useEffect(() => {
    const timer = setTimeout(() => moveIndicator(activeIndex, false), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleClick = (index, item) => {
    if (index === activeIndex) return
    triggerParticles(activeIndex, index)
    moveIndicator(index)
    if (onItemClick) onItemClick(item)
  }

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <div className="gooey-nav-indicator" ref={indicatorRef} />
      <ul>
        {items.map((item, index) => (
          <li key={item.id} className={activeIndex === index ? 'active' : ''}>
            <a
              href={`#${item.id}`}
              ref={(el) => (itemRefs.current[index] = el)}
              onClick={(e) => {
                e.preventDefault()
                handleClick(index, item)
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default GooeyNav
