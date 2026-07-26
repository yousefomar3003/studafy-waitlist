import { useCallback, useRef } from 'react'
import clsx from 'clsx'
import { useHorizontalRail } from '../../hooks/useHorizontalRail'
import { FEATURES } from '../../data/features'
import FeatureCard from '../ui/FeatureCard'

const CARD_W = 330
const COUNT = FEATURES.length
const pad = (n) => String(n).padStart(2, '0')

export default function WhatsIncluded() {
  const railCountRef = useRef(null)
  const railFillRef = useRef(null)

  // Writes only — no layout reads on the scroll path.
  const onProgress = useCallback((p) => {
    if (railFillRef.current) {
      railFillRef.current.style.transform = `scaleX(${Math.max(0.08, p)})`
    }
    if (railCountRef.current) {
      const i = Math.min(COUNT, Math.floor(p * COUNT) + 1)
      railCountRef.current.textContent = `${pad(i)} — ${pad(COUNT)}`
    }
  }, [])

  const { sectionRef, trackRef, railed } = useHorizontalRail({ onProgress })

  return (
    <section
      ref={sectionRef}
      id="included"
      className={clsx('relative bg-wash', railed ? 'h-[300vh]' : 'h-auto')}
    >
      <div
        className={clsx(
          'flex flex-col gap-[44px]',
          railed ? 'sticky top-0 h-svh overflow-hidden justify-center' : 'py-24'
        )}
      >
        {/* w-full: without it, mx-auto on a column flex item overrides stretch and the
            heading shrink-to-fits to the middle of the screen, away from the rail. */}
        <div className="w-full rail-gutter flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[11px] tracking-[.08em] uppercase text-blue mb-3.5">What's included</p>
            <h2 className="font-display font-medium text-[clamp(26px,3.4vw,44px)] leading-[1.1] tracking-[-.02em] text-navy m-0 max-w-[18ch]">One platform. Everything the school needs.</h2>
          </div>
          {railed && (
            <div className="hidden min-[820px]:flex items-center gap-3.5 min-w-[200px]">
              <span ref={railCountRef} className="font-mono text-xs tracking-[.08em] text-muted tabular-nums">
                {pad(1)} — {pad(COUNT)}
              </span>
              <span className="relative flex-1 h-0.5 bg-line rounded-full overflow-hidden">
                {/* Initial scale is inline, not a scale-x-* utility: Tailwind v4 compiles
                    those to the `scale` property, which multiplies with the `transform`
                    the scroll handler writes instead of being replaced by it. */}
                <span
                  ref={railFillRef}
                  style={{ transform: 'scaleX(.08)' }}
                  className="absolute inset-0 bg-cyan origin-left will-change-transform"
                />
              </span>
            </div>
          )}
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
          {FEATURES.map((f) => (
            <div
              key={f.id}
              className={clsx('min-w-0 snap-center', !railed && 'flex-[0_0_min(84vw,340px)]')}
              style={railed ? { flex: `0 0 ${CARD_W}px` } : undefined}
            >
              <FeatureCard title={f.title} body={f.body} icon={f.icon} Icon={f.Icon} num={f.id} />
            </div>
          ))}
          <div
            className={clsx(
              'min-w-0 snap-center flex items-center justify-center',
              !railed && 'flex-[0_0_min(84vw,340px)]'
            )}
            style={railed ? { flex: `0 0 ${CARD_W}px` } : undefined}
          >
            <p className="font-display font-semibold text-[40px] tracking-[-.025em] text-navy m-0 max-[759px]:text-[32px]">All of it. Free.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
