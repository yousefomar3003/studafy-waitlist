import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const positionOffset = Number(process.env.WAITLIST_POSITION_OFFSET || '186')

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(200).json({ count: positionOffset })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return res.status(200).json({ count: (count || 0) + positionOffset })
  } catch (err) {
    console.error('[waitlist-count] Failed:', err.message)
    return res.status(200).json({ count: positionOffset })
  }
}
