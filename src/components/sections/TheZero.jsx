import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const PIN_MIN_WIDTH = 820
const WORDS = ['Free.', 'Forever.', 'For every school.']

export default function TheZero() {
  const calm = useReducedMotion()
  const sectionRef = useRef(null)
  const wordsRef = useRef([])
  const orbitRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < PIN_MIN_WIDTH)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (calm || isMobile || !sectionRef.current) return

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress
        wordsRef.current.forEach((w, i) => {
          if (!w) return
          const on = p > 0.18 + i * 0.18
          w.style.opacity = on ? '1' : '0'
          w.style.transform = on ? 'translateY(0)' : 'translateY(14px)'
        })
        if (orbitRef.current) {
          orbitRef.current.style.transform = `translate(-50%,-50%) rotate(${Math.min(1, p / 0.82) * 360}deg)`
          orbitRef.current.style.opacity = p > 0.82 ? '0' : '1'
        }
      }
    })

    return () => st.kill()
  }, [calm, isMobile])

  return (
    <section ref={sectionRef} className="relative h-[300vh] bg-white max-[819px]:h-auto" id="pricing">
      <div className="sticky top-0 h-svh overflow-hidden flex flex-col items-center justify-center max-[819px]:static max-[819px]:h-auto max-[819px]:overflow-visible max-[819px]:py-24 max-[819px]:bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-tint)_0%,#fff_60%)]">
        <p className="font-mono text-[11px] tracking-[.08em] uppercase text-blue mb-2">What the school pays</p>
        <div className="relative flex items-center justify-center">
          <span className="font-display font-semibold text-[min(46vw,560px)] leading-[.8] tracking-[-.04em] text-navy">0</span>
          {/* Centring lives in the inline transform, not -translate-x-1/2: Tailwind v4
              compiles those to the `translate` property, which stacks on top of the
              `transform` this element is animated with instead of being replaced. */}
          <div
            ref={orbitRef}
            style={{ transform: 'translate(-50%,-50%)' }}
            className="absolute left-1/2 top-1/2 w-[min(46vw,560px)] h-[min(46vw,560px)]"
          >
            <span className="absolute left-1/2 -top-2 w-[18px] h-[18px] -ml-[9px] rounded-full bg-cyan shadow-[0_0_22px_rgba(34,201,241,.7)]" />
          </div>
        </div>
        <div className="flex flex-wrap gap-[18px] items-baseline justify-center mt-6 min-h-[56px]">
          {WORDS.map((word, i) => (
            <span
              key={i}
              ref={el => wordsRef.current[i] = el}
              className="font-display font-semibold text-[clamp(24px,3.2vw,44px)] tracking-[-.02em] text-navy opacity-0"
              style={{ transition: 'opacity 500ms cubic-bezier(.22,1,.36,1), transform 500ms cubic-bezier(.22,1,.36,1)' }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
