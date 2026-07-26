import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export default function FreeForReal() {
  const calm = useReducedMotion()

  return (
    <section className="bg-white py-[140px] px-6 text-center">
      <div className="max-w-[820px] mx-auto">
        <h2 className="font-display font-medium text-[clamp(24px,3.4vw,42px)] leading-[1.15] tracking-[-.02em] text-muted m-0">
          Not a free trial. Not free for the first year. Not a limited plan.
        </h2>
        <motion.p
          className="font-display font-semibold text-[clamp(36px,5vw,72px)] leading-none tracking-[-.025em] text-navy mt-10"
          initial={calm ? {} : { opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={calm ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          Free. For real.
          <motion.span
            className="inline-block w-3.5 h-3.5 rounded-full bg-cyan ml-3.5 align-middle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={calm ? { duration: 0 } : { duration: 0.4, delay: 0.7 }}
          />
        </motion.p>
        <p className="text-sm leading-[1.5] text-muted mt-[26px]">
          Every admin, finance, transport, and teaching feature. For every school. Always.
        </p>
      </div>
    </section>
  )
}
