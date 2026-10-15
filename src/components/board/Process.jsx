import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLang } from '@/contexts/LanguageContext'
import { copy } from '@/i18n/site'
import { processSteps } from '@/data/process'
import { l } from '@/lib/utils'
import { PowerTitle } from './PowerTitle'

gsap.registerPlugin(ScrollTrigger)

// Five stages on one trace. Scrolling through the section carries the signal along it and powers
// each stage as it arrives; every stage cites the real project where it happened.
export function Process() {
  const { lang } = useLang()
  const T = copy[lang].process
  const root = useRef(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.current.querySelectorAll('.stage').forEach((s) => s.classList.add('on'))
      return
    }
    const ctx = gsap.context(() => {
      const stages = gsap.utils.toArray('.stage')
      // horizontal pipe on desktop, vertical on phones: grow along whichever axis it runs
      const axis = matchMedia('(max-width: 900px)').matches ? 'scaleY' : 'scaleX'
      gsap.fromTo('.pipe-fill', { [axis]: 0 }, {
        [axis]: 1, ease: 'none',
        scrollTrigger: {
          trigger: '.pipe', start: 'top 75%', end: 'bottom 45%', scrub: 0.6,
          onUpdate: (st) => stages.forEach((s, i) => s.classList.toggle('on', st.progress >= i / stages.length + 0.02)),
        },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="process" id="proceso" ref={root}>
      <PowerTitle text={T.title} />
      <p className="sec-intro">{T.intro}</p>
      <div className="pipe">
        <span className="pipe-line" aria-hidden="true"><span className="pipe-fill" /></span>
        <ol className="stages">
        {processSteps.map((s, i) => {
          const ex = l(s.example, lang), at = ex.indexOf(': ')
          return (
            <li key={s.id} className="stage">
              <span className="stage-pad" aria-hidden="true">{i + 1}</span>
              <h3>{l(s.title, lang)}</h3>
              <p>{l(s.detail, lang)}</p>
              <p className="stage-ex">
                <b>{at > 0 ? ex.slice(0, at) : ''}</b>
                {at > 0 ? ex.charAt(at + 2).toUpperCase() + ex.slice(at + 3) : ex}
              </p>
            </li>
          )
        })}
        </ol>
      </div>
    </section>
  )
}
