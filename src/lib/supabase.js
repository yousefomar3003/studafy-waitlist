import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function submitWaitlist(entry) {
  if (!supabase) {
    console.warn('[studafy] Supabase not configured, using stub')
    return { position: 187 }
  }

  const { error } = await supabase.from('waitlist').insert({
    school: entry.school,
    country: entry.country,
    location: entry.location,
    frameworks: entry.frameworks,
    phone: entry.phone,
    name: entry.name,
    email: entry.email,
  })

  if (error) throw error

  const { count } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })

  return { position: count || 1 }
}
