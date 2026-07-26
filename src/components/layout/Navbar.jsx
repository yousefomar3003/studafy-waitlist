import { useState, useEffect } from 'react'
import clsx from 'clsx'

export default function Navbar() {
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const handler = () => setSolid(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.offsetTop - 40, behavior: 'smooth' })
  }

  return (
    <header className={clsx(
      'fixed top-0 left-0 right-0 z-60 transition-all duration-300',
      solid
        ? 'bg-white/82 backdrop-blur-[16px] border-b border-line'
        : 'bg-transparent border-b border-transparent'
    )}>
      <div className="max-w-[1280px] mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex-shrink-0 bg-transparent border-0 p-0 cursor-pointer">
          <img src="/uploads/IMG_8180-removebg-preview.png" alt="Studafy" className="h-[60px] w-auto block" />
        </button>
        <nav className="hidden items-center gap-7 min-[760px]:flex">
          <button onClick={() => scrollTo('included')} className="text-[14px] font-medium text-ink bg-transparent border-0 p-0 cursor-pointer hover:text-blue transition-colors">What you get</button>
          <button onClick={() => scrollTo('roles')} className="text-[14px] font-medium text-ink bg-transparent border-0 p-0 cursor-pointer hover:text-blue transition-colors">Roles</button>
          <button onClick={() => scrollTo('pricing')} className="text-[14px] font-medium text-ink bg-transparent border-0 p-0 cursor-pointer hover:text-blue transition-colors">Pricing</button>
          <button onClick={() => scrollTo('waitlist')} className="font-display font-semibold text-sm text-white bg-gradient-to-br from-blue to-cyan px-[22px] py-[11px] rounded-full shadow-[var(--shadow-sm),0_12px_32px_rgba(34,116,228,.18)] hover:scale-[1.03] transition-transform whitespace-nowrap">Join the waitlist</button>
        </nav>
      </div>
    </header>
  )
}
