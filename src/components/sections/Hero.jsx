import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

function WordMask({ children, delay, calm }) {
  return (
    <span className="inline-block overflow-hidden align-bottom pb-[.06em]">
      <motion.span
        className="inline-block"
        initial={calm ? { y: 0 } : { y: '110%' }}
        animate={{ y: 0 }}
        transition={calm ? { duration: 0 } : { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  )
}

function HeroLine1({ calm }) {
  const words = 'Every school deserves great software.'.split(/(\s+)/)
  return (
    <span className="block">
      {words.map((tok, i) => (
        tok.trim()
          ? <WordMask key={i} delay={0.12 + i * 0.06} calm={calm}>{tok}</WordMask>
          : <span key={i}>{tok}</span>
      ))}
    </span>
  )
}

function HeroLine2({ calm }) {
  const parts = [
    { text: 'So we made it ', accent: false },
    { text: 'free', accent: true },
    { text: ' — forever.', accent: false },
  ]
  let wordIdx = 0
  return (
    <span className="block">
      {parts.map((part, pi) => {
        const tokens = part.text.split(/(\s+)/)
        return tokens.map((tok, ti) => {
          if (!tok.trim()) return <span key={`${pi}-${ti}`}>{tok}</span>
          const idx = wordIdx++
          return (
            <WordMask key={`${pi}-${ti}`} delay={0.12 + 0.26 + idx * 0.06} calm={calm}>
              {part.accent ? <span className="text-cyan">{tok}</span> : tok}
            </WordMask>
          )
        })
      })}
    </span>
  )
}

export default function Hero() {
  const calm = useReducedMotion()
  const sectionRef = useRef(null)
  const headRef = useRef(null)
  const driftA = useRef(null)
  const driftB = useRef(null)
  const driftC = useRef(null)
  const driftD = useRef(null)
  const routeRef = useRef(null)

  useEffect(() => {
    if (calm || !sectionRef.current) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.3,
        invalidateOnRefresh: true,
      }
    })

    tl.to(headRef.current, { scale: 0.92, opacity: 0.5, ease: 'none' }, 0)
    tl.to(driftA.current, { x: -160, y: 60, ease: 'none' }, 0)
    tl.to(driftB.current, { x: -120, y: -70, ease: 'none' }, 0)
    tl.to(driftC.current, { x: 150, y: 70, ease: 'none' }, 0)
    tl.to(driftD.current, { x: 130, y: -60, ease: 'none' }, 0)

    if (routeRef.current) {
      gsap.to(routeRef.current, {
        strokeDashoffset: 0,
        duration: 2.6,
        delay: 0.5,
        ease: 'power2.out',
      })
    }

    return () => tl.kill()
  }, [calm])

  return (
    <section ref={sectionRef} className="relative h-[210vh] bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-tint)_0%,#fff_60%)]" id="top">
      <div className="sticky top-0 h-svh overflow-hidden flex flex-col items-center justify-center px-6 pt-24">
        {/* Floating transparent character cutouts */}
        <div ref={driftA} className="absolute left-[3vw] top-[23vh] w-[clamp(0px,15vw,220px)] hidden max-[1179px]:hidden min-[1180px]:block">
          <div className="animate-float-a">
            <img src="/uploads/IMG_8365-removebg-preview.png" alt="" aria-hidden="true" className="w-full block" />
          </div>
        </div>
        <div ref={driftB} className="absolute left-[8vw] bottom-[5vh] w-[clamp(0px,13vw,190px)] hidden max-[1179px]:hidden min-[1180px]:block">
          <div className="animate-float-b">
            <img src="/uploads/hero-reader.png" alt="" aria-hidden="true" className="w-full block" />
          </div>
        </div>
        <div ref={driftC} className="absolute right-[3vw] top-[20vh] w-[clamp(0px,15vw,215px)] hidden max-[1179px]:hidden min-[1180px]:block">
          <div className="animate-float-c">
            <img src="/uploads/hero-teacher.png" alt="" aria-hidden="true" className="w-full block" />
          </div>
        </div>
        <div ref={driftD} className="absolute right-[3vw] bottom-[6vh] w-[clamp(0px,19vw,280px)] hidden max-[1179px]:hidden min-[1180px]:block">
          <div className="animate-float-d">
            <img src="/uploads/hero-students.png" alt="" aria-hidden="true" className="w-full block" />
          </div>
        </div>

        {/* Head content */}
        <div ref={headRef} className="relative z-2 text-center max-w-[min(880px,100%)] origin-[50%_40%]">
          <p className="font-mono text-[11px] tracking-[.08em] uppercase text-blue mb-[22px]">
            Waitlist open · school management platform
          </p>
          <h1 className="font-display font-semibold text-[clamp(32px,5.6vw,88px)] leading-[1.02] tracking-[-.03em] text-navy m-0">
            <HeroLine1 calm={calm} />
            <HeroLine2 calm={calm} />
          </h1>
          <p className="text-[17px] leading-[1.6] text-muted max-w-[60ch] mx-auto mt-7">
            Studafy runs the whole school — admissions, finance, transport, teaching, and family communication — in one platform. Free for the school. Free for everyone in it.
          </p>
          <div className="flex flex-wrap gap-4 items-center justify-center mt-9">
            <button onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="font-display font-semibold text-base text-white bg-gradient-to-br from-blue to-cyan px-8 py-4 rounded-full shadow-[var(--shadow-lg)] hover:scale-[1.03] transition-transform cursor-pointer border-0">
              Join the waitlist
            </button>
            <button onClick={() => document.getElementById('included')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="text-[15px] text-navy border-b border-line pb-0.5 bg-transparent p-0 cursor-pointer hover:text-blue hover:border-blue transition-colors">
              See what's included
            </button>
          </div>
        </div>

        {/* SVG Route line */}
        <svg className="absolute left-0 right-0 bottom-[6vh] w-full h-[60px] z-1" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
          <path
            ref={routeRef}
            d="M0 46 C 220 12, 360 58, 600 34 S 980 8, 1200 40"
            fill="none"
            stroke="#22C9F1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="1600"
            strokeDashoffset="1600"
            opacity=".85"
          />
        </svg>
      </div>
    </section>
  )
}
