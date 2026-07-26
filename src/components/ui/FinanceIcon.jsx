/**
 * Stand-in for the "Finance & fees" artwork. Drawn inline so the card can never 404.
 */
export default function FinanceIcon({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="fin-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5AA0F5" />
          <stop offset="1" stopColor="#2274E4" />
        </linearGradient>
        <linearGradient id="fin-coin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7FE3FA" />
          <stop offset="1" stopColor="#22C9F1" />
        </linearGradient>
      </defs>

      {/* coin, mid-drop */}
      <circle cx="26" cy="11" r="7.5" fill="url(#fin-coin)" />
      <circle cx="26" cy="11" r="4.2" fill="none" stroke="#fff" strokeWidth="1.6" opacity=".75" />

      {/* legs sit behind the body */}
      <rect x="14" y="45" width="6.5" height="9" rx="2.6" fill="#1B5FC4" />
      <rect x="31" y="45" width="6.5" height="9" rx="2.6" fill="#1B5FC4" />

      {/* tail */}
      <path
        d="M9.8 33c-3.4-1.4-5.2 1.9-2.6 3.2 2.1 1 3.6-.8 2.3-2.1"
        fill="none"
        stroke="#1B5FC4"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      <ellipse cx="27" cy="38" rx="19" ry="14" fill="url(#fin-body)" />

      {/* ear */}
      <path d="M35 25.5 42 20.5 41.4 29Z" fill="#1B5FC4" />

      {/* coin slot */}
      <rect x="19" y="24" width="14" height="3.8" rx="1.9" fill="#1D1A63" opacity=".8" />

      {/* snout */}
      <ellipse cx="45.5" cy="39" rx="7" ry="6" fill="#A9D0FF" />
      <ellipse cx="43.6" cy="39" rx="1.3" ry="1.7" fill="#1D1A63" opacity=".7" />
      <ellipse cx="47.6" cy="39" rx="1.3" ry="1.7" fill="#1D1A63" opacity=".7" />

      <circle cx="38" cy="34" r="2" fill="#14163A" />
    </svg>
  )
}
