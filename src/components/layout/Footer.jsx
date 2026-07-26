export default function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({ top: el.offsetTop - 40, behavior: 'smooth' })
      return
    }
    window.location.href = `/#${id}`
  }

  return (
    <footer className="bg-ink px-6 pt-22 pb-10">
      <div className="max-w-[1280px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-12">
        <div className="flex flex-col gap-[18px] max-w-[34ch]">
          <img src="/uploads/IMG_8180-removebg-preview.png" alt="Studafy" className="h-[52px] w-auto self-start brightness-0 invert" />
          <p className="font-display font-semibold text-[22px] leading-[1.25] tracking-[-.02em] text-white m-0">Free forever for schools.</p>
          <a href="mailto:hello@studafy.com" className="font-mono text-xs tracking-[.08em] uppercase text-cyan hover:text-white transition-colors">hello@studafy.com</a>
        </div>
        <div className="flex flex-col gap-3.5">
          <p className="font-mono text-[11px] tracking-[.12em] uppercase text-white/40 m-0">Platform</p>
          <button onClick={() => scrollTo('included')} className="text-[15px] text-white/72 hover:text-white bg-transparent border-0 p-0 cursor-pointer text-left transition-colors">What you get</button>
          <button onClick={() => scrollTo('roles')} className="text-[15px] text-white/72 hover:text-white bg-transparent border-0 p-0 cursor-pointer text-left transition-colors">Roles</button>
          <button onClick={() => scrollTo('pricing')} className="text-[15px] text-white/72 hover:text-white bg-transparent border-0 p-0 cursor-pointer text-left transition-colors">Pricing</button>
          <button onClick={() => scrollTo('waitlist')} className="text-[15px] text-white/72 hover:text-white bg-transparent border-0 p-0 cursor-pointer text-left transition-colors">Join the waitlist</button>
        </div>
        <div className="flex flex-col gap-3.5">
          <p className="font-mono text-[11px] tracking-[.12em] uppercase text-white/40 m-0">Legal</p>
          <a href="/privacy" className="text-[15px] text-white/72 hover:text-white transition-colors">Privacy policy</a>
          <a href="/terms" className="text-[15px] text-white/72 hover:text-white transition-colors">Terms of service</a>
          <a href="/data" className="text-[15px] text-white/72 hover:text-white transition-colors">Data processing</a>
        </div>
        <div className="flex flex-col gap-3.5 max-w-[40ch]">
          <p className="font-mono text-[11px] tracking-[.12em] uppercase text-white/40 m-0">Data &amp; privacy</p>
          <p className="text-sm leading-[1.6] text-white/72 m-0">Studafy analyses school and learning data to run the platform and to find where a student is starting to slip. Data is encrypted in transit and at rest, processed only to deliver the service, never sold, and never shared with advertisers. A school stays the owner of its data and can export or delete it at any time.</p>
          <a href="/privacy" className="font-mono text-xs tracking-[.08em] uppercase text-cyan hover:text-white transition-colors">Read the full policy</a>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto mt-14 pt-6 border-t border-white/12 flex flex-wrap gap-4 justify-between font-mono text-[11px] tracking-[.08em] uppercase text-white/45">
        <span>&copy; 2026 Studafy. All rights reserved.</span>
        <span>Free for the school. Free for everyone in it.</span>
      </div>
    </footer>
  )
}
