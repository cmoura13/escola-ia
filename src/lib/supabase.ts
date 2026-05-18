import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})

export async function testarConexaoSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return { ok: false, erro: 'Supabase nao configurado' }
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    return { ok: !error, erro: error?.message }
  } catch (err: any) {
    return { ok: false, erro: err.message }
  }
}