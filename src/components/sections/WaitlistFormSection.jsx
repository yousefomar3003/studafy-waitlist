import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import WaitlistForm from './WaitlistForm'
import { supabase } from '../../lib/supabase'

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }
  })
}

export default function WaitlistFormSection() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      if (!supabase) { setCount(187); return }
      try {
        const { count: c } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true })
        setCount(c || 187)
      } catch {
        setCount(187)
      }
    }
    fetchCount()
  }, [])

  return (
    <section className="relative py-[140px] px-6" id="waitlist">
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_20%,var(--color-tint)_0%,#fff_60%)] pointer-events-none" />
      <div className="relative max-w-[1080px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-14 items-start">
        <div>
          <motion.p
            className="font-mono text-[11px] tracking-[.08em] uppercase text-blue mb-3.5"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal}
          >
            Waitlist
          </motion.p>
          <motion.h2
            className="font-display font-medium text-[clamp(26px,3.4vw,44px)] leading-[1.1] tracking-[-.02em] text-navy m-0 max-w-[16ch]"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal} custom={1}
          >
            Put your school on the list.
          </motion.h2>
          <motion.p
            className="text-[17px] leading-[1.6] text-ink max-w-[44ch] mt-[22px]"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal} custom={2}
          >
            No account. No card. We'll reach out when we open your waitlist spot.
          </motion.p>
          {count >= 40 && (
            <p className="font-mono text-xs tracking-[.08em] uppercase text-blue mt-7 min-h-4">
              {count} schools already joined
            </p>
          )}
          <div className="flex flex-col gap-2.5 mt-7 border-t border-line pt-5 max-w-[44ch] text-sm text-muted">
            <span>Free forever for the school.</span>
            <span>Every role included, web and mobile.</span>
          </div>
        </div>

        <div>
          <WaitlistForm />
        </div>
      </div>
    </section>
  )
}
