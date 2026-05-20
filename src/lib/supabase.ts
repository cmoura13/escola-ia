import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabaseInstance: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  })
}

function getClient(): SupabaseClient {
  if (!supabaseInstance) {
    throw new Error(
      'Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }
  return supabaseInstance
}

export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getClient()
      return (client as any)[prop]
    },
  }
) as SupabaseClient

export async function testarConexaoSupabase() {
  if (!supabaseInstance) return { ok: false, erro: 'Supabase nao configurado' }
  try {
    const { error } = await supabaseInstance.from('users').select('count', { count: 'exact', head: true })
    return { ok: !error, erro: error?.message }
  } catch (err: any) {
    return { ok: false, erro: err.message }
  }
}