import { useState, useRef, useEffect, useCallback, useId } from 'react'
import clsx from 'clsx'
import { COUNTRIES } from '../../data/countries'

export default function CountryCombobox({ value, onChange, onError, error }) {
  const [query, setQuery] = useState(value?.[0] || '')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const listId = useId()

  const filtered = COUNTRIES.filter(c =>
    !query.trim() || c[0].toLowerCase().includes(query.trim().toLowerCase())
  )

  const pick = useCallback((c) => {
    setQuery(c[0])
    onChange(c)
    setOpen(false)
    onError?.(null)
  }, [onChange, onError])

  useEffect(() => {
    if (activeIdx < 0) return
    listRef.current
      ?.querySelector(`[data-option-index="${activeIdx}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActiveIdx(i => Math.min(filtered.length - 1, i + 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setActiveIdx(i => Math.max(0, i - 1))
    }
    if (e.key === 'Enter' && open && activeIdx >= 0 && filtered[activeIdx]) {
      e.preventDefault()
      pick(filtered[activeIdx])
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id="country"
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(null); onError?.(null); setActiveIdx(-1) }}
        onFocus={() => { setOpen(true); setActiveIdx(-1) }}
        onBlur={() => { setTimeout(() => { setOpen(false); onError?.(q => !COUNTRIES.find(c => c[0] === q)) }, 120) }}
        onKeyDown={handleKeyDown}
        placeholder="Search countries"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={activeIdx >= 0 ? `${listId}-option-${activeIdx}` : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${listId}-error` : undefined}
        className={clsx(
          'w-full font-sans text-base text-ink bg-wash border rounded-[14px] px-4 py-[14px] outline-none',
          error ? 'border-err' : 'border-line focus:border-blue'
        )}
      />
      {open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Countries"
          className="absolute top-full left-0 right-0 z-20 mt-1.5 max-h-[230px] overflow-y-auto bg-white border border-line rounded-[14px] shadow-[var(--shadow-sm),0_12px_32px_rgba(34,116,228,.14)]"
        >
          {filtered.length > 0 ? filtered.map((c, i) => (
            <button
              key={c[0]}
              id={`${listId}-option-${i}`}
              data-option-index={i}
              type="button"
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => { e.preventDefault(); pick(c) }}
              className={clsx(
                'w-full flex items-center justify-between gap-3 bg-transparent border-0 border-b border-wash',
                'px-4 py-3 font-sans text-[15px] text-ink text-left cursor-pointer',
                'hover:bg-wash',
                i === activeIdx && 'bg-wash'
              )}
            >
              <span>{c[0]}</span>
              <span className="font-mono text-[12px] text-muted">{c[1]}</span>
            </button>
          )) : (
            <p className="m-0 px-4 py-4 font-sans text-sm text-muted">
              No countries match “{query.trim()}”.
            </p>
          )}
        </div>
      )}
      {error && <span id={`${listId}-error`} className="text-[13px] text-err mt-2 block">{error}</span>}
    </div>
  )
}
