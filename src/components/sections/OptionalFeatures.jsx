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

export default function OptionalFeatures() {
  const calm = useReducedMotion()
  const radarWrapRef = useRef(null)

  useEffect(() => {
    if (calm || !radarWrapRef.current) return

    const st = ScrollTrigger.create({
      trigger: radarWrapRef.current,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        const paths = radarWrapRef.current.querySelectorAll('path[stroke-dasharray]')
        paths.forEach((p, i) => {
          gsap.to(p, {
            strokeDashoffset: 0,
            duration: 1.5,
            delay: i * 0.12,
            ease: 'power2.out',
          })
        })
      }
    })

    return () => st.kill()
  }, [calm])

  return (
    <section className="bg-white py-[140px] px-6 border-t border-line">
      <div className="max-w-[1080px] mx-auto">
        <motion.p
          className="font-mono text-[11px] tracking-[.08em] uppercase text-blue mb-3.5"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal}
        >
          Optional for families · never for the school
        </motion.p>
        <motion.h2
          className="font-display font-medium text-[clamp(26px,3.4vw,44px)] leading-[1.1] tracking-[-.02em] text-navy m-0 max-w-[22ch]"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal} custom={1}
        >
          Three things a family can add.
        </motion.h2>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-14 mt-12 items-center">
          <div>
            <motion.p
              className="text-[17px] leading-[1.6] text-ink max-w-[60ch] mt-6"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal} custom={2}
            >
              A live bus tracker for the ride to school. Quizzes and flashcards generated from the material the teacher already assigned. And an academic evaluation that reads how a student answers, alongside their grades, to find the exact topic where they're starting to slip — often weeks before a report card would. Families choose these. No one has to, and no school feature is ever locked behind them.
            </motion.p>
            <motion.div
              className="flex items-end gap-2 mt-9"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal} custom={3}
            >
              <div className="relative w-[140px]">
                <img src="/uploads/IMG_8365.PNG" alt="" aria-hidden="true" className="block mix-blend-multiply" />
                <span className="absolute left-[8%] top-0 w-3 h-3 rounded-full bg-cyan animate-spark-pulse" />
              </div>
              <div className="relative w-[104px] mb-2.5 opacity-85">
                <img src="/uploads/IMG_8365.PNG" alt="" aria-hidden="true" className="block mix-blend-multiply" />
              </div>
            </motion.div>
          </div>

          <div ref={radarWrapRef} className="bg-wash border border-line rounded-[20px] p-[26px] shadow-[var(--shadow-md)]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="font-mono text-[11px] tracking-[.12em] uppercase text-blue m-0">Learning-gap radar</p>
              <p className="font-mono text-[11px] tracking-[.12em] uppercase text-muted m-0">Live</p>
            </div>
            <svg viewBox="0 0 480 340" aria-hidden="true" className="w-full h-auto block">
              <defs>
                <radialGradient id="rg-scan" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22C9F1" stopOpacity=".55" />
                  <stop offset="100%" stopColor="#22C9F1" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g stroke="rgba(29,26,99,.12)" strokeWidth="1" fill="none">
                <circle cx="300" cy="170" r="150" />
                <circle cx="300" cy="170" r="110" />
                <circle cx="300" cy="170" r="70" />
                <circle cx="300" cy="170" r="30" />
                <path d="M150 170 H 450 M300 20 V 320" />
              </g>
              <g className="animate-scan" style={{ transformOrigin: '300px 170px' }}>
                <path d="M300 170 L300 20 A150 150 0 0 1 406 64 Z" fill="url(#rg-scan)" />
                <path d="M300 170 L300 20" stroke="#22C9F1" strokeWidth="2" opacity=".9" />
              </g>
              <path d="M300 60 L382 92 L416 170 L382 248 L300 280 L218 248 L184 170 L218 92 Z" fill="rgba(34,116,228,.08)" stroke="#2274E4" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="900" strokeDashoffset="900" />
              <g>
                <circle cx="300" cy="60" r="9" fill="#2274E4" />
                <circle cx="382" cy="92" r="9" fill="#2274E4" />
                <circle cx="416" cy="170" r="9" fill="#2274E4" />
                <circle cx="382" cy="248" r="9" fill="#2274E4" />
                <circle cx="300" cy="280" r="9" fill="#2274E4" />
                <circle cx="218" cy="248" r="9" fill="#2274E4" />
                <circle cx="184" cy="170" r="13" fill="#22C9F1" className="animate-spark-pulse" style={{ transformOrigin: '184px 170px' }} />
                <circle cx="218" cy="92" r="9" fill="#2274E4" />
                <circle cx="184" cy="170" r="24" fill="none" stroke="#22C9F1" strokeWidth="1.5" opacity=".45" />
              </g>
              <g stroke="#2274E4" strokeWidth="2" fill="none" opacity=".8">
                <path d="M40 74 H 120 L 160 108" strokeDasharray="170" strokeDashoffset="170" />
                <path d="M40 170 H 150" strokeDasharray="170" strokeDashoffset="170" />
                <path d="M40 266 H 120 L 160 232" strokeDasharray="170" strokeDashoffset="170" />
              </g>
              <g fill="#1D1A63" fontFamily="Space Grotesk, monospace" fontSize="12" letterSpacing="1.4">
                <text x="40" y="62">QUIZZES</text>
                <text x="40" y="158">FLASHCARDS</text>
                <text x="40" y="254">GRADES</text>
              </g>
              <g fontFamily="Space Grotesk, monospace" fontSize="12" letterSpacing="1.4">
                <rect x="86" y="292" width="188" height="30" rx="15" fill="#EAF0FB" stroke="#2274E4" />
                <text x="104" y="312" fill="#2274E4">GAP FOUND · TOPIC 07</text>
              </g>
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mt-14">
          {[
            { title: 'Bus tracker', body: 'Live location and an ETA for the ride to school.' },
            { title: 'Quizzes and flashcards', body: 'Generated from the material the teacher assigned, with spaced repetition that adapts.' },
            { title: 'Academic evaluation', body: 'On track by week 3, not a surprise at term\'s end.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="border-t border-line pt-[18px]"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal} custom={i}
            >
              <h3 className="font-display font-semibold text-lg text-navy m-0 mb-2">{item.title}</h3>
              <p className="text-[15px] leading-[1.6] text-muted m-0">{item.body}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-[13px] leading-[1.5] text-muted mt-8">Schools are never billed. Nothing schools use is behind a paywall.</p>
      </div>
    </section>
  )
}
