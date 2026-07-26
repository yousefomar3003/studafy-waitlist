import clsx from 'clsx'
import { FRAMEWORKS } from '../../data/frameworks'

export default function FrameworkChips({ selected, onChange, error }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Academic framework">
        {FRAMEWORKS.map(label => {
          const active = selected.includes(label)
          return (
            <button
              key={label}
              type="button"
              aria-pressed={active}
              onClick={() => {
                if (active) onChange(selected.filter(f => f !== label))
                else onChange([...selected, label])
              }}
              className={clsx(
                'font-sans text-sm px-4 py-[10px] rounded-full cursor-pointer border transition-transform duration-[140ms]',
                'hover:scale-[1.03]',
                active
                  ? 'bg-blue text-white border-blue'
                  : 'bg-white text-ink border-line'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
      {error && <span className="text-[13px] text-err mt-2 block">{error}</span>}
    </div>
  )
}
