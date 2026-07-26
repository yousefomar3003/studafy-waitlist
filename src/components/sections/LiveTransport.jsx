import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const PIN_MIN_WIDTH = 820

export default function LiveTransport() {
  const calm = useReducedMotion()
  const sectionRef = useRef(null)
  const busRouteRef = useRef(null)
  const busRef = useRef(null)
  const etaRef = useRef(null)
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
        if (busRouteRef.current) {
          busRouteRef.current.style.strokeDashoffset = String(-1400 * (1 - Math.min(1, p * 1.15)))
        }
        if (busRef.current) {
          busRef.current.style.left = `${76 - p * 58}%`
          busRef.current.style.top = `${46 - Math.sin(p * Math.PI) * 16}%`
        }
        if (etaRef.current) {
          const secs = Math.round(252 - p * 214)
          etaRef.current.textContent = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
        }
      }
    })

    return () => st.kill()
  }, [calm, isMobile])

  return (
    <section ref={sectionRef} className="relative h-[260vh] bg-wash max-[819px]:h-auto">
      <div className="sticky top-0 h-svh overflow-hidden flex flex-col justify-center max-[819px]:static max-[819px]:h-auto max-[819px]:overflow-visible max-[819px]:py-24">
        {/* w-full: mx-auto on a column flex item overrides stretch and would shrink this
            block to its content width, floating it away from the left gutter. */}
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <p className="font-mono text-[11px] tracking-[.08em] uppercase text-blue mb-3.5">Live transport</p>
          <h2 className="font-display font-medium text-[clamp(26px,3.4vw,44px)] leading-[1.1] tracking-[-.02em] text-navy m-0 max-w-[26ch]">The question every parent asks: where's the bus?</h2>
          <p className="text-[17px] leading-[1.6] text-muted max-w-[56ch] mt-[22px]">Live location, an accurate ETA, and a notification five minutes before arrival. One of three things a family can add to the school's platform.</p>
        </div>

        <div className="relative w-full h-[min(46vh,380px)] mt-10 bg-white border-y border-line max-[819px]:h-[190px] max-[819px]:mt-7">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true">
            <path
              ref={busRouteRef}
              d="M40 150 C 300 150, 340 60, 620 90 S 940 150, 1160 70"
              fill="none"
              stroke="#22C9F1"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="1400"
              strokeDashoffset="-1400"
            />
          </svg>

          <div ref={busRef} className="absolute left-[76%] top-[44%] w-[clamp(150px,20vw,240px)] -translate-x-1/2 -translate-y-1/2 max-[819px]:!left-[18%] max-[819px]:!top-[46%]">
            <img src="/uploads/IMG_8382.PNG" alt="" aria-hidden="true" className="w-full block mix-blend-multiply" />
            <span className="absolute -right-1.5 -top-1.5 w-3 h-3 rounded-full bg-cyan animate-ring-pulse" />
          </div>

          <div className="absolute right-[5%] top-[10%] w-[190px] bg-white border border-line rounded-[20px] p-[18px] shadow-[var(--shadow-md)] max-[819px]:static max-[819px]:w-auto max-[819px]:m-5">
            <p className="font-mono text-[11px] tracking-[.08em] uppercase text-muted m-0 mb-2">Bus 04 · en route</p>
            <p className="font-mono text-[32px] text-navy m-0">ETA <span ref={etaRef}>04:12</span></p>
            <p className="text-xs text-muted mt-2.5 m-0">Notification at 5 minutes.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
