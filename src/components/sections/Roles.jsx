import { useCallback, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { gsap } from 'gsap'
import { useHorizontalRail } from '../../hooks/useHorizontalRail'
import { ROLES } from '../../data/roles'
import RoleCard from '../ui/RoleCard'

const CARD_W = 300
const MAX_TILT = 4 // degrees, reached at the edge of the falloff
const MAX_LIFT = 6 // px the centred card rises
const FALLOFF = 0.32 // share of the viewport over which the effect eases out

export default function Roles() {
  const cardRefs = useRef([])
  const metricsRef = useRef([])
  const viewportRef = useRef(0)

  // All layout reads live here. This runs once per refresh, never per scroll frame —
  // reading geometry after writing transforms is what made the old rail stutter.
  const onMeasure = useCallback(() => {
    viewportRef.current = window.innerWidth
    metricsRef.current = cardRefs.current
      .filter(Boolean)
      .map((wrapper) => {
        const card = wrapper.querySelector('article')
        if (!card) return null
        const glow = card.querySelector('[data-glow]')
        gsap.set(card, { transformPerspective: 900, transformOrigin: '50% 50%', force3D: true })
        return {
          center: wrapper.offsetLeft + wrapper.offsetWidth / 2,
          setRot: gsap.quickSetter(card, 'rotateY', 'deg'),
          setY: gsap.quickSetter(card, 'y', 'px'),
          setGlow: glow ? gsap.quickSetter(glow, 'opacity') : null
        }
      })
      .filter(Boolean)
  }, [])

  // Writes only.
  const onProgress = useCallback((_progress, x) => {
    const vw = viewportRef.current || window.innerWidth
    const half = vw / 2
    for (const m of metricsRef.current) {
      const signed = (m.center + x - half) / vw
      const t = Math.min(1, Math.abs(signed) / FALLOFF)
      const eased = t * t * (3 - 2 * t) // smoothstep: no kink as a card passes centre
      m.setRot(-MAX_TILT * eased * Math.sign(signed))
      m.setY(-MAX_LIFT * (1 - eased))
      m.setGlow?.(1 - eased)
    }
  }, [])

  const { sectionRef, trackRef, railed } = useHorizontalRail({ onProgress, onMeasure })

  useEffect(() => {
    if (railed) return
    const cards = cardRefs.current
      .filter(Boolean)
      .map((w) => w.querySelector('article'))
      .filter(Boolean)
    gsap.set(cards, { clearProps: 'transform' })
    cards.forEach((c) => {
      const glow = c.querySelector('[data-glow]')
      if (glow) glow.style.opacity = ''
    })
  }, [railed])

  return (
    <section
      ref={sectionRef}
      id="roles"
      className={clsx('relative bg-white', railed ? 'h-[400vh]' : 'h-auto')}
    >
      <div
        className={clsx(
          'flex flex-col gap-10',
          railed ? 'sticky top-0 h-svh overflow-hidden justify-center' : 'py-24'
        )}
      >
        {/* w-full: without it, mx-auto on a column flex item overrides stretch and the
            heading shrink-to-fits to the middle of the screen, away from the rail. */}
        <div className="w-full rail-gutter">
          <p className="font-mono text-[11px] tracking-[.08em] uppercase text-blue mb-3.5">Everyone included</p>
          <h2 className="font-display font-medium text-[clamp(26px,3.4vw,44px)] leading-[1.1] tracking-[-.02em] text-navy m-0 max-w-[18ch]">Eight roles. One platform. One price: zero.</h2>
        </div>

        <div
          ref={trackRef}
          className={clsx(
            'flex items-stretch gap-6 rail-gutter',
            railed
              ? 'will-change-transform [backface-visibility:hidden]'
              : 'overflow-x-auto snap-x snap-mandatory pb-2 max-[759px]:gap-4'
          )}
        >
          {ROLES.map((r, i) => (
            <div
              key={r.title}
              ref={(el) => { cardRefs.current[i] = el }}
              className={clsx('min-w-0 snap-center', !railed && 'flex-[0_0_min(84vw,340px)]')}
              style={railed ? { flex: `0 0 ${CARD_W}px` } : undefined}
            >
              <RoleCard {...r} />
            </div>
          ))}
          <div
            className={clsx(
              'min-w-0 snap-center flex items-center justify-center',
              !railed && 'flex-[0_0_min(84vw,340px)]'
            )}
            style={railed ? { flex: `0 0 ${CARD_W}px` } : undefined}
          >
            <p className="font-display font-semibold text-[40px] tracking-[-.025em] text-navy m-0 max-[759px]:text-[32px]">Every role. Free.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
