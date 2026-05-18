// Configuração centralizada da aplicação
// Este arquivo pode ser editado manualmente se .env.local não funcionar

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Escola-IA',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

// Supabase - Tente usar variáveis de ambiente primeiro
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
}

// Verificar se está configurado
export function isSupabaseConfigured(): boolean {
  return !!SUPABASE_CONFIG.url && !!SUPABASE_CONFIG.anonKey && 
         !SUPABASE_CONFIG.url.includes('placeholder') && 
         !SUPABASE_CONFIG.url.includes('seu-projeto')
}
