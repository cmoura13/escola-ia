// Script de inicialização - verifica configurações
import { isSupabaseConfigured } from './config'

export function checkEnvironment() {
  const issues: string[] = []

  if (!isSupabaseConfigured()) {
    issues.push('❌ Supabase não configurado. Verifique o arquivo .env.local')
    issues.push('   Crie o arquivo na raiz do projeto com:')
    issues.push('   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co')
    issues.push('   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave')
  }

  if (issues.length > 0) {
    console.warn('⚠️  Problemas de configuração detectados:')
    issues.forEach(i => console.warn(i))
  } else {
    console.log('✅ Ambiente configurado corretamente!')
  }

  return issues.length === 0
}
