import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import FreeForReal from './components/sections/FreeForReal'
import WhatsIncluded from './components/sections/WhatsIncluded'
import Roles from './components/sections/Roles'
import LiveTransport from './components/sections/LiveTransport'
import TheZero from './components/sections/TheZero'
import OptionalFeatures from './components/sections/OptionalFeatures'
import HowIsThisFree from './components/sections/HowIsThisFree'
import WaitlistFormSection from './components/sections/WaitlistFormSection'
import LegalPage from './components/legal/LegalPage'
import { LEGAL_PAGES } from './data/legalPages'

export default function App() {
  const legalPage = LEGAL_PAGES[window.location.pathname.replace(/\/$/, '') || '/']

  useEffect(() => {
    document.title = legalPage
      ? `${legalPage.title} — Studafy`
      : 'Studafy — Free forever for schools'
  }, [legalPage])

  if (legalPage) {
    return <LegalPage page={legalPage} />
  }

  return (
    <div className="w-full overflow-x-clip bg-white">
      <Navbar />
      <Hero />
      <FreeForReal />
      <WhatsIncluded />
      <Roles />
      <LiveTransport />
      <TheZero />
      <OptionalFeatures />
      <HowIsThisFree />
      <WaitlistFormSection />
      <Footer />
    </div>
  )
}
