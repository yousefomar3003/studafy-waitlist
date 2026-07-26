import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'

export default function SuccessState({ school, position }) {
  const [count, setCount] = useState(0)
  const [tickVisible, setTickVisible] = useState(false)
  const rafRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setTickVisible(true), 60)
    const t0 = performance.now()
    const duration = 1100

    function step(now) {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(position * eased))
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)

    return () => {
      clearTimeout(t)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [position])

  return (
    <div className="relative w-full bg-white border border-line rounded-[20px] shadow-[var(--shadow-md)] p-10 text-center">
      <svg viewBox="0 0 64 64" aria-hidden="true" className="w-16 h-16 mx-auto mb-5 block">
        <circle cx="32" cy="32" r="30" fill="none" stroke="#E3E8F2" strokeWidth="2" />
        <path
          d="M18 33 L28 43 L47 22"
          fill="none"
          stroke="#18C29C"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="60"
          strokeDashoffset={tickVisible ? 0 : 60}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <h3 className="font-display font-semibold text-[34px] tracking-[-.02em] text-navy m-0">You're on the list.</h3>
      <p className="text-base leading-[1.6] text-ink mt-3.5">
        {school} is on the waitlist. We'll reach out when your spot opens.
      </p>
      <p className="font-mono text-[44px] text-blue mt-4">#{count}</p>
      <div className="flex items-end justify-center gap-3 mt-6">
        <img src="/uploads/IMG_8373.PNG" alt="" aria-hidden="true" className="w-[104px] mix-blend-multiply animate-float-a" />
        <img src="/uploads/IMG_8374.PNG" alt="" aria-hidden="true" className="w-[126px] mix-blend-multiply animate-float-b" />
      </div>
    </div>
  )
}
