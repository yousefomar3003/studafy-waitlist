import clsx from 'clsx'

export default function PhoneInput({ dial, value, onChange, onError, error }) {
  return (
    <div>
      <div className="flex gap-2.5">
        <span className="flex items-center gap-2 bg-wash border border-line rounded-[14px] px-4 py-[14px] font-mono text-[15px] text-navy whitespace-nowrap">
          {dial}
        </span>
        <input
          type="tel"
          inputMode="tel"
          value={value}
          onChange={(e) => {
            const v = e.target.value.replace(/^0+/, '')
            onChange(v)
            onError?.(null)
          }}
          placeholder="Phone number"
          autoComplete="tel"
          className={clsx(
            'flex-1 min-w-0 font-sans text-base text-ink bg-wash border rounded-[14px] px-4 py-[14px] outline-none',
            error ? 'border-err' : 'border-line focus:border-blue'
          )}
        />
      </div>
      {error && <span className="text-[13px] text-err mt-2 block">{error}</span>}
    </div>
  )
}
