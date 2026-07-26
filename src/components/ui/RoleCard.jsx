// Crop windows for the two source images that contain two figures. `x` is the extra
// horizontal shift applied on top of centring, as a share of the image's own width.
//   left  — tuned for IMG_8379 (Finance Manager), isolates the figure on the left
//   right — tuned for IMG_8364 (Student), isolates the figure on the right
const CROPS = {
  left: { height: 290, x: '28%' },
  right: { height: 320, x: '-29%' }
}

function RoleShot({ src, focus }) {
  const crop = CROPS[focus]

  // The 200px frame is fixed either way, so decoding artwork never shifts the rail.
  if (crop) {
    return (
      <div className="relative h-[200px] bg-wash rounded-[14px] overflow-hidden">
        <img
          src={src}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute top-0 left-1/2 w-auto max-w-none mix-blend-multiply"
          style={{ height: crop.height, transform: `translateX(calc(-50% + ${crop.x}))` }}
        />
      </div>
    )
  }

  return (
    <div className="h-[200px] bg-wash rounded-[14px] overflow-hidden flex items-end justify-center">
      <img
        src={src}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="h-[190px] w-auto max-w-none mix-blend-multiply"
      />
    </div>
  )
}

export default function RoleCard({ title, badge, body, img, focus }) {
  return (
    <article className="relative bg-white border border-line rounded-[20px] shadow-[var(--shadow-md)] h-full w-full flex flex-col gap-[14px] p-[26px]">
      {/* The rail fades this in for the centred card. Animating opacity keeps the lift
          on the compositor instead of repainting a box-shadow every frame. */}
      <span
        data-glow
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[20px] shadow-[var(--shadow-xl)] opacity-0"
      />
      <RoleShot src={img} focus={focus} />
      <span className="font-mono text-[11px] tracking-[.08em] text-blue">{badge}</span>
      <h3 className="font-display font-semibold text-[22px] leading-[1.25] text-navy m-0">{title}</h3>
      <p className="text-[15px] leading-[1.6] text-muted m-0">{body}</p>
    </article>
  )
}
