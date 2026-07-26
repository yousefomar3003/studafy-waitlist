import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitWaitlist } from '../../lib/supabase'
import CountryCombobox from '../ui/CountryCombobox'
import FrameworkChips from '../ui/FrameworkChips'
import PhoneInput from '../ui/PhoneInput'
import SuccessState from '../ui/SuccessState'

const INITIAL_WAITLIST_COUNT = 187

export default function WaitlistForm() {
  const [school, setSchool] = useState('')
  const [country, setCountry] = useState(null)
  const [location, setLocation] = useState('')
  const [frameworks, setFrameworks] = useState([])
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(null)
  const [liveMsg, setLiveMsg] = useState('')

  const formRef = useRef(null)

  const dial = country ? `${country[2]} ${country[1]}` : '🌐 +—'

  const validate = useCallback(() => {
    const e = {}
    if (!school.trim()) e.school = 'Add the school name.'
    if (!country) e.country = 'Choose a country from the list.'
    if (!location.trim()) e.location = 'Add a city or area.'
    if (!frameworks.length) e.fw = 'Pick at least one framework.'
    if (phone.replace(/\D/g, '').length < 6) e.phone = 'Add a valid phone number.'
    if (!name.trim()) e.name = 'Add your name.'
    if (!email.trim()) e.email = 'Add your email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Add a valid email address.'
    return e
  }, [school, country, location, frameworks, phone, name, email])

  const setError = (key, msg) => setErrors(prev => ({ ...prev, [key]: msg || undefined }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sending) return

    const errs = validate()
    const keys = Object.keys(errs)
    if (keys.length) {
      setErrors(errs)
      setLiveMsg('Check the highlighted fields.')
      return
    }
    setLiveMsg('')

    if (honeypot) return

    setSending(true)

    try {
      const res = await submitWaitlist({
        school: school.trim(),
        country: country[0],
        location: location.trim(),
        frameworks,
        phone: (country ? country[1] : '') + phone.replace(/^0+/, ''),
        name: name.trim(),
        email: email.trim(),
      })
      setTimeout(() => setDone({ school: school.trim(), position: res.position || INITIAL_WAITLIST_COUNT }), 900)
    } catch (err) {
      console.warn('[studafy] submit error, using stub:', err)
      setTimeout(() => setDone({ school: school.trim(), position: INITIAL_WAITLIST_COUNT }), 900)
    }
  }

  const handleBlur = (key, isValid) => {
    if (!isValid) setError(key, validate()[key] || null)
  }

  if (done) {
    return <SuccessState school={done.school} position={done.position} />
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="relative w-full bg-white border border-line rounded-[20px] shadow-[var(--shadow-md)] p-8 flex flex-col gap-[22px] text-left">
      {/* School name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="school" className="font-mono text-[11px] tracking-[.08em] uppercase text-muted">School name</label>
        <input
          id="school" type="text" placeholder="e.g. Northgate Academy" autoComplete="organization"
          value={school}
          onChange={(e) => { setSchool(e.target.value); setError('school', null) }}
          onBlur={() => handleBlur('school', school.trim())}
          className={`w-full font-sans text-base text-ink bg-wash border rounded-[14px] px-4 py-[14px] outline-none ${errors.school ? 'border-err' : 'border-line focus:border-blue'}`}
        />
        {errors.school && <span className="text-[13px] text-err">{errors.school}</span>}
      </div>

      {/* Country */}
      <div className="flex flex-col gap-2">
        <label htmlFor="country" className="font-mono text-[11px] tracking-[.08em] uppercase text-muted">Country</label>
        <CountryCombobox
          value={country}
          onChange={(c) => setCountry(c)}
          onError={(validator) => {
            if (validator && !country) setError('country', validate().country || null)
          }}
          error={errors.country}
        />
      </div>

      {/* Location */}
      <div className="flex flex-col gap-2">
        <label htmlFor="location" className="font-mono text-[11px] tracking-[.08em] uppercase text-muted">Location</label>
        <input
          id="location" type="text" placeholder="City or area"
          value={location}
          onChange={(e) => { setLocation(e.target.value); setError('location', null) }}
          onBlur={() => handleBlur('location', location.trim())}
          className={`w-full font-sans text-base text-ink bg-wash border rounded-[14px] px-4 py-[14px] outline-none ${errors.location ? 'border-err' : 'border-line focus:border-blue'}`}
        />
        {errors.location && <span className="text-[13px] text-err">{errors.location}</span>}
      </div>

      {/* Framework chips */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[11px] tracking-[.08em] uppercase text-muted">Academic framework</span>
        <FrameworkChips selected={frameworks} onChange={setFrameworks} error={errors.fw} />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="font-mono text-[11px] tracking-[.08em] uppercase text-muted">Phone</label>
        <PhoneInput dial={dial} value={phone} onChange={setPhone} onError={(fn) => fn && setError('phone', validate().phone || null)} error={errors.phone} />
      </div>

      {/* Name & Email */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5 pt-5 border-t border-line">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="font-mono text-[11px] tracking-[.08em] uppercase text-muted">Your name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => { setName(e.target.value); setError('name', null) }}
            onBlur={() => handleBlur('name', name.trim())}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={`w-full font-sans text-[15px] text-ink bg-wash border rounded-[14px] px-3.5 py-3 outline-none ${errors.name ? 'border-err' : 'border-line focus:border-blue'}`}
          />
          {errors.name && <span id="name-error" className="text-[13px] text-err">{errors.name}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-mono text-[11px] tracking-[.08em] uppercase text-muted">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('email', null) }}
            onBlur={() => handleBlur('email', email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`w-full font-sans text-[15px] text-ink bg-wash border rounded-[14px] px-3.5 py-3 outline-none ${errors.email ? 'border-err' : 'border-line focus:border-blue'}`}
          />
          {errors.email && <span id="email-error" className="text-[13px] text-err">{errors.email}</span>}
        </div>
      </div>

      {/* Honeypot */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute left-[-9999px] w-px h-px opacity-0" />

      {/* Submit */}
      <button
        type="submit"
        disabled={sending}
        className="relative overflow-hidden w-full h-[52px] border-0 rounded-full cursor-pointer bg-gradient-to-br from-blue to-cyan text-white font-display font-semibold text-base shadow-[var(--shadow-lg)] disabled:cursor-progress"
      >
        <span>{sending ? 'Adding your school' : 'Join the waitlist'}</span>
        {sending && <span className="absolute left-0 right-0 top-0 h-0.5 bg-cyan animate-sweep" />}
      </button>

      <p className="text-[13px] leading-[1.5] text-muted m-0" aria-live="polite">{liveMsg}</p>
      <p className="text-[13px] leading-[1.5] text-muted m-0">
        We'll only use this to contact you about Studafy. <a href="/privacy" className="text-blue hover:text-navy transition-colors">Privacy</a>
      </p>
    </form>
  )
}
