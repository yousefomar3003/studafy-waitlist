import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

export const PIN_MIN_WIDTH = 820


/**
 * Drives a sticky section whose card track slides horizontally as the page scrolls.
 *
 * The section's height is derived from the measured track width, so one pixel of vertical
 * scroll equals one pixel of horizontal travel. Every rail then moves at the same rate
 * regardless of how many cards it holds.
 *
 * `onProgress(progress, x)` runs on each scroll frame. It must only *write* to the DOM —
 * reading layout there (getBoundingClientRect, offsetLeft, ...) forces a synchronous
 * reflow on every frame. Read layout in `onMeasure` instead, which runs once per refresh.
 */
export function useHorizontalRail({ onProgress, onMeasure } = {}) {
  const calm = useReducedMotion()
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < PIN_MIN_WIDTH
  )

  // Keep the latest callbacks without re-running the ScrollTrigger effect.
  const cbRef = useRef({})
  cbRef.current = { onProgress, onMeasure }

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < PIN_MIN_WIDTH)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const railed = !calm && !isMobile

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    if (!railed) {
      section.style.height = ''
      gsap.set(track, { clearProps: 'transform' })
      return
    }

    const setX = gsap.quickSetter(track, 'x', 'px')
    let distance = 0

    const measure = () => {
      // scrollWidth drops the trailing padding on an overflowing flex row in most
      // browsers, which clips the last panel. Derive the extent from the last child
      // plus the track's own resolved gutter.
      const last = track.lastElementChild
      const gutter = parseFloat(getComputedStyle(track).paddingRight) || 0
      const contentRight = last
        ? last.offsetLeft + last.offsetWidth + gutter
        : track.scrollWidth
      distance = Math.max(0, contentRight - window.innerWidth)
      section.style.height = `${window.innerHeight + distance}px`
      cbRef.current.onMeasure?.()
    }

    // refreshInit runs before ScrollTrigger measures start/end, so the height we set
    // here is the one it reads.
    ScrollTrigger.addEventListener('refreshInit', measure)
    measure()

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const x = -self.progress * distance
        setX(x)
        cbRef.current.onProgress?.(self.progress, x)
      }
    })

    // Card widths are wrong until the artwork decodes, so the first measurement is too.
    let alive = true
    const imgs = Array.from(track.querySelectorAll('img'))
    Promise.allSettled(
      imgs.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => {})))
    ).then(() => {
      if (alive) ScrollTrigger.refresh()
    })

    const ro = new ResizeObserver(() => ScrollTrigger.refresh())
    ro.observe(track)

    return () => {
      alive = false
      ro.disconnect()
      st.kill()
      ScrollTrigger.removeEventListener('refreshInit', measure)
      section.style.height = ''
      gsap.set(track, { clearProps: 'transform' })
    }
  }, [railed])

  return { sectionRef, trackRef, railed }
}
