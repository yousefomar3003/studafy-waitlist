import Footer from '../layout/Footer'

export default function LegalPage({ page }) {
  return (
    <div className="min-h-dvh bg-white text-ink">
      <header className="border-b border-line bg-white">
        <div className="max-w-[1120px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <a href="/" aria-label="Studafy home" className="shrink-0">
            <img
              src="/uploads/IMG_8180-removebg-preview.png"
              alt="Studafy"
              className="h-[58px] w-auto block"
            />
          </a>
          <a
            href="/#waitlist"
            className="font-display font-semibold text-sm text-white bg-gradient-to-br from-blue to-cyan px-5 py-3 rounded-full shadow-[var(--shadow-sm),0_12px_32px_rgba(34,116,228,.18)] hover:scale-[1.03] transition-transform whitespace-nowrap"
          >
            Join the waitlist
          </a>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-line bg-wash">
          <div className="absolute inset-0 bg-[radial-gradient(70%_100%_at_15%_0%,var(--color-tint)_0%,transparent_70%)] pointer-events-none" />
          <div className="relative max-w-[880px] mx-auto px-6 py-20 sm:py-24">
            <p className="font-mono text-[11px] tracking-[.12em] uppercase text-blue m-0">
              {page.eyebrow}
            </p>
            <h1 className="font-display font-medium text-[clamp(38px,6vw,68px)] leading-[1.02] tracking-[-.035em] text-navy mt-4 mb-0">
              {page.title}
            </h1>
            <p className="text-[18px] sm:text-[20px] leading-[1.65] text-muted max-w-[62ch] mt-6 mb-0">
              {page.summary}
            </p>
            <p className="font-mono text-xs tracking-[.06em] uppercase text-muted mt-8 mb-0">
              Last updated 26 July 2026
            </p>
          </div>
        </section>

        <article className="max-w-[880px] mx-auto px-6 py-16 sm:py-20">
          {page.notice && (
            <p className="bg-tint border border-blue/20 rounded-[16px] px-5 py-4 text-[15px] leading-[1.65] text-navy mb-12">
              {page.notice}
            </p>
          )}

          <div className="flex flex-col gap-12">
            {page.sections.map((section) => (
              <section key={section.title} className="scroll-mt-8">
                <h2 className="font-display font-semibold text-[24px] sm:text-[28px] leading-[1.2] tracking-[-.02em] text-navy m-0">
                  {section.title}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="text-[16px] leading-[1.75] text-ink mt-4 mb-0">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 mb-0 pl-5 flex flex-col gap-3 text-[16px] leading-[1.7] text-ink marker:text-blue">
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}
