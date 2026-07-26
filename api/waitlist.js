import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const positionOffset = Number(process.env.WAITLIST_POSITION_OFFSET || '186')
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)

const FRAMEWORKS = ['Arabic National', 'IGCSE', 'IB', 'American / SAT', 'French', 'Other']

const COUNTRIES = [
  'Argentina','Australia','Austria','Bahrain','Bangladesh',
  'Belgium','Brazil','Canada','Chile','China',
  'Colombia','Denmark','Egypt','Finland','France',
  'Germany','Ghana','Greece','India','Indonesia',
  'Ireland','Italy','Japan','Jordan','Kenya',
  'Kuwait','Lebanon','Malaysia','Mexico','Morocco',
  'Netherlands','New Zealand','Nigeria','Norway','Oman',
  'Pakistan','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Saudi Arabia','Singapore','South Africa',
  'South Korea','Spain','Sweden','Switzerland','Thailand',
  'Tunisia','Turkey','United Arab Emirates','United Kingdom',
  'United States','Vietnam',
]

function getCorsHeaders(origin) {
  if (!origin || !allowedOrigins.includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function sendJson(res, body, status, cors = {}) {
  res.writeHead(status, { ...cors, 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()))
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function validate(body) {
  const fields = {}
  const str = (v) => (typeof v === 'string' ? v.trim() : '')

  const school = str(body.school)
  if (!school) fields.school = 'Add the school name.'
  else if (school.length > 200) fields.school = 'School name is too long.'

  const country = str(body.country)
  if (!country) fields.country = 'Choose a country from the list.'
  else if (!COUNTRIES.includes(country)) fields.country = 'Choose a country from the list.'

  const location = str(body.location)
  if (!location) fields.location = 'Add a city or area.'
  else if (location.length > 120) fields.location = 'Location is too long.'

  const frameworks = Array.isArray(body.frameworks) ? body.frameworks.map(str) : []
  if (!frameworks.length) fields.fw = 'Pick at least one framework.'
  else if (!frameworks.every(f => FRAMEWORKS.includes(f))) fields.fw = 'Unknown framework selected.'

  const phone = str(body.phone).replace(/[\s()-]/g, '')
  if (!/^\+[1-9][0-9]{5,19}$/.test(phone)) fields.phone = 'Add a valid phone number.'

  const name = str(body.name)
  if (name.length > 120) fields.name = 'Name is too long.'

  const email = str(body.email)
  if (email && (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) {
    fields.email = 'That email address looks wrong.'
  }

  if (Object.keys(fields).length) return { fields }
  return {
    fields,
    clean: {
      school,
      country,
      location,
      frameworks,
      phone,
      name: name || null,
      email: email || null,
    },
  }
}

async function sendConfirmationEmail(to, school, position) {
  if (!smtpUser || !smtpPass) {
    console.warn('[waitlist] SMTP not configured, skipping email')
    return
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
  })

  await transporter.sendMail({
    from: `"Studafy" <${smtpUser}>`,
    to,
    subject: `You're on the Studafy waitlist!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <div style="background:linear-gradient(135deg,#2563eb,#06b6d4);padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700;">Welcome to Studafy</h1>
          </div>
          <div style="padding:32px 40px;">
            <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 16px;">Great news — <strong>${school}</strong> is officially on the Studafy waitlist!</p>
            <div style="background:#f0f7ff;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
              <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;font-family:monospace;">Your position</p>
              <p style="color:#2563eb;font-size:48px;font-weight:800;margin:0;line-height:1;">#${position}</p>
            </div>
            <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 16px;">We're building the smartest platform for school management and we'll keep you updated every step of the way.</p>
            <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0;">Thanks for believing in us early.<br><strong>The Studafy Team</strong></p>
          </div>
          <div style="padding:20px 40px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">This is a one-time confirmation email. We won't spam you.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  const cors = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    res.writeHead(200, cors)
    return res.end()
  }

  if (req.method !== 'POST') {
    return sendJson(res, { error: 'Method not allowed' }, 405, cors)
  }

  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[waitlist] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return sendJson(res, { error: 'Server not configured.' }, 500, cors)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let body
    try {
      body = await readBody(req)
    } catch {
      return sendJson(res, { error: 'Invalid request.', fields: {} }, 400, cors)
    }

    // Honeypot check
    if (typeof body.company_website === 'string' && body.company_website.trim() !== '') {
      return sendJson(res, { position: positionOffset + 1, duplicate: false }, 200, cors)
    }

    const { fields, clean } = validate(body)
    if (!clean) return sendJson(res, { error: 'Check the highlighted fields.', fields }, 400, cors)

    // Insert into Supabase
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        school: clean.school,
        country: clean.country,
        location: clean.location,
        frameworks: clean.frameworks,
        phone: clean.phone,
        name: clean.name,
        email: clean.email,
      })
      .select('signup_no')
      .single()

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation — duplicate school+country
        const { data: existing } = await supabase
          .from('waitlist')
          .select('signup_no')
          .eq('school_normalized', clean.school.toLowerCase().trim())
          .eq('country', clean.country)
          .single()

        const pos = existing ? positionOffset + existing.signup_no : positionOffset + 1

        if (clean.email) {
          try {
            await sendConfirmationEmail(clean.email, clean.school, pos)
            console.log('[waitlist] Confirmation email sent to', clean.email)
          } catch (err) {
            console.error('[waitlist] Failed to send confirmation email:', err.message, err.code || '')
          }
        }

        return sendJson(res, { position: pos, duplicate: true }, 200, cors)
      }
      throw error
    }

    const position = positionOffset + data.signup_no

    if (clean.email) {
      try {
        await sendConfirmationEmail(clean.email, clean.school, position)
        console.log('[waitlist] Confirmation email sent to', clean.email)
      } catch (err) {
        console.error('[waitlist] Failed to send confirmation email:', err.message, err.code || '')
      }
    }

    return sendJson(res, { position, duplicate: false }, 200, cors)
  } catch (err) {
    console.error('[waitlist] Handler failed:', err)
    return sendJson(res, { error: 'Something went wrong. Please try again.' }, 500, cors)
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
