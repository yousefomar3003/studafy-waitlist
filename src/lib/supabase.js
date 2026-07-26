const API_BASE = import.meta.env.VITE_API_URL || ''

export class WaitlistError extends Error {
  constructor(message, { status = 0, fields = {} } = {}) {
    super(message)
    this.name = 'WaitlistError'
    this.status = status
    this.fields = fields
  }
}

/**
 * Submit a waitlist entry via the Vercel API.
 * The browser never touches the database directly.
 */
export async function submitWaitlist(entry) {
  if (!API_BASE && import.meta.env.DEV) {
    console.warn('[studafy] VITE_API_URL not set — using stub')
    return { position: 187, duplicate: false }
  }

  const res = await fetch(`${API_BASE}/api/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      school: entry.school,
      country: entry.country,
      location: entry.location,
      frameworks: entry.frameworks,
      phone: entry.phone,
      name: entry.name || null,
      email: entry.email || null,
      company_website: entry.honeypot || '',
    }),
  })

  const body = await res.json()

  if (!res.ok) {
    throw new WaitlistError(
      body.error || 'Something went wrong. Please try again.',
      { status: res.status, fields: body.fields || {} },
    )
  }

  return { position: body.position, duplicate: Boolean(body.duplicate) }
}
