import { useState, useEffect, useCallback } from 'react'

export function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0)

  const update = useCallback(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const vh = window.innerHeight
    const span = Math.max(1, rect.height - vh)
    const p = Math.min(1, Math.max(0, -rect.top / span))
    setProgress(p)
  }, [ref])

  useEffect(() => {
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [update])

  return progress
}
