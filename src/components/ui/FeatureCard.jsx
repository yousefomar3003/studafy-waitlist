/**
 * A feature card. Width is owned by the rail (the flex parent) — this fills whatever
 * cell it is given, so every card in a row is the same size.
 */
export default function FeatureCard({ title, body, icon, Icon, num }) {
  return (
    <article className="bg-white border border-line rounded-[20px] shadow-[var(--shadow-md)] h-full w-full flex flex-col gap-4 p-[30px] transition-transform duration-[140ms] hover:scale-[1.02]">
      {/* Fixed box either way, so a slow or missing asset never shifts the layout. */}
      <span className="w-14 h-14 shrink-0 block">
        {Icon ? (
          <Icon className="w-14 h-14 block" />
        ) : (
          <img
            src={icon}
            alt=""
            aria-hidden="true"
            width="56"
            height="56"
            decoding="async"
            className="w-14 h-14 object-contain mix-blend-multiply"
          />
        )}
      </span>
      <h3 className="font-display font-semibold text-[21px] leading-[1.25] text-navy m-0">{title}</h3>
      <p className="text-[15px] leading-[1.6] text-muted m-0">{body}</p>
      <span className="font-mono text-[11px] tracking-[.08em] text-blue mt-auto pt-2">
        {String(num).padStart(2, '0')}
      </span>
    </article>
  )
}
