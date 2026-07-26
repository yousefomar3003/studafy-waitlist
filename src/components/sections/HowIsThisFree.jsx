import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }
  })
}

export default function HowIsThisFree() {
  const calm = useReducedMotion()
  const flowWrapRef = useRef(null)

  useEffect(() => {
    if (calm || !flowWrapRef.current) return

    const st = ScrollTrigger.create({
      trigger: flowWrapRef.current,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        const paths = flowWrapRef.current.querySelectorAll('path[stroke-dasharray]')
        paths.forEach((p, i) => {
          gsap.to(p, {
            strokeDashoffset: 0,
            duration: 1.2,
            delay: i * 0.12,
            ease: 'power2.out',
          })
        })
      }
    })

    return () => st.kill()
  }, [calm])

  return (
    <section className="bg-wash py-[140px] px-6">
      <div className="max-w-[1080px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-14 items-center">
        <div>
          <motion.h2
            className="font-display font-medium text-[clamp(26px,3.4vw,44px)] leading-[1.1] tracking-[-.02em] text-navy m-0 max-w-[18ch]"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal}
          >
            So how is this free?
          </motion.h2>
          <motion.p
            className="text-[17px] leading-[1.6] text-ink max-w-[60ch] mt-6"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal} custom={1}
          >
            Schools pay nothing—ever. Studafy is sustained entirely by families who choose to unlock our three optional family features.
          </motion.p>
        </div>

        <div ref={flowWrapRef} className="bg-white border border-line rounded-[20px] p-[30px] shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-between gap-3 mb-5">
            <p className="font-mono text-[11px] tracking-[.12em] uppercase text-blue m-0">Where the money comes from</p>
            <p className="font-mono text-[11px] tracking-[.12em] uppercase text-muted m-0">School cost 0</p>
          </div>
          <svg viewBox="0 0 480 250" aria-hidden="true" className="w-full h-auto block">
            <defs>
              <linearGradient id="fg-core" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2274E4" />
                <stop offset="100%" stopColor="#22C9F1" />
              </linearGradient>
            </defs>
            <rect x="4" y="26" width="140" height="66" rx="16" fill="#F4F7FE" stroke="#E3E8F2" />
            <text x="74" y="54" fill="#1D1A63" fontFamily="General Sans, Inter, sans-serif" fontSize="14" fontWeight="600" textAnchor="middle">Families who add</text>
            <text x="74" y="74" fill="#52586E" fontFamily="Inter, sans-serif" fontSize="12" textAnchor="middle">the family features</text>
            <rect x="176" y="20" width="128" height="78" rx="18" fill="url(#fg-core)" />
            <text x="240" y="57" fill="#F4F7FE" fontFamily="General Sans, Inter, sans-serif" fontSize="20" fontWeight="600" textAnchor="middle">Studafy</text>
            <text x="240" y="77" fill="rgba(255,255,255,.75)" fontFamily="Space Grotesk, monospace" fontSize="10" letterSpacing="1.2" textAnchor="middle">FUNDED HERE</text>
            <rect x="336" y="26" width="140" height="66" rx="16" fill="#F4F7FE" stroke="#E3E8F2" />
            <text x="406" y="54" fill="#1D1A63" fontFamily="General Sans, Inter, sans-serif" fontSize="14" fontWeight="600" textAnchor="middle">Your school</text>
            <text x="406" y="74" fill="#52586E" fontFamily="Inter, sans-serif" fontSize="12" textAnchor="middle">pays nothing</text>
            <g stroke="#22C9F1" strokeWidth="3" fill="none" strokeLinecap="round">
              <path d="M144 59 H 176" strokeDasharray="34" strokeDashoffset="34" />
              <path d="M304 59 H 336" strokeDasharray="34" strokeDashoffset="34" />
              <path d="M240 98 V 140 H 90 V 176" strokeDasharray="330" strokeDashoffset="330" />
              <path d="M240 98 V 140 H 390 V 176" strokeDasharray="330" strokeDashoffset="330" />
            </g>
            <g fontFamily="Space Grotesk, monospace" fontSize="12" letterSpacing="1.4">
              <rect x="16" y="180" width="148" height="34" rx="17" fill="#EAF0FB" stroke="#2274E4" />
              <text x="90" y="202" fill="#2274E4" textAnchor="middle">EVERY FEATURE</text>
              <rect x="316" y="180" width="148" height="34" rx="17" fill="#EAF0FB" stroke="#2274E4" />
              <text x="390" y="202" fill="#2274E4" textAnchor="middle">EVERY ROLE</text>
            </g>
            <text x="240" y="238" fill="#52586E" fontFamily="Space Grotesk, monospace" fontSize="11" letterSpacing="1.4" textAnchor="middle">NOTHING BEHIND A PAYWALL</text>
          </svg>
        </div>
      </div>
    </section>
  )
}
