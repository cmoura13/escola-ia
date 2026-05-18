'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, GraduationCap, Lock, Mail, ArrowRight, AlertTriangle } from 'lucide-react'
import { supabase, testarConexaoSupabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const TEST_USERS = [
  { nome: 'Administrador', email: 'admin@escola-ia.com', senha: 'admin123', role: 'administrador' },
  { nome: 'Aluno Teste', email: 'aluno@escola-ia.com', senha: 'aluno123', role: 'aluno' },
]

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [conexaoOk, setConexaoOk] = useState<boolean | null>(null)
  const [erroConexao, setErroConexao] = useState('')

  useEffect(() => {
    async function verificarConexao() {
      const resultado = await testarConexaoSupabase()
      setConexaoOk(resultado.ok)
      if (!resultado.ok) {
        setErroConexao(resultado.erro || 'Falha na conexao')
      }
    }
    verificarConexao()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (conexaoOk === false) {
      setError('Nao foi possivel conectar ao servidor. Verifique as configuracoes do Supabase.')
      setIsLoading(false)
      return
    }

    try {
      console.log('Login:', email)

      // Criar usuarios de teste se nao existirem
      try {
        const { data: existingUsers } = await supabase
          .from('users')
          .select('email')
          .in('email', TEST_USERS.map(u => u.email))

        const existingEmails = new Set((existingUsers || []).map((u: any) => u.email))

        for (const testUser of TEST_USERS) {
          if (!existingEmails.has(testUser.email)) {
            console.log('Criando usuario:', testUser.email)
            await supabase.from('users').insert({
              nome: testUser.nome,
              email: testUser.email,
              senha_hash: testUser.senha,
              role: testUser.role,
              status: 'ativo',
            })
          }
        }
      } catch (err) {
        console.log('Usuarios ja existem ou erro RLS:', err)
      }

      // Buscar usuario
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)

      if (queryError) {
        console.error('Erro:', queryError)
        setError('Erro ao buscar usuario: ' + queryError.message)
        setIsLoading(false)
        return
      }

      if (!users || users.length === 0) {
        setError('Email ou senha incorretos')
        setIsLoading(false)
        return
      }

      const user = users[0]

      // Verificar senha
      let isPasswordValid = false
      const testAccount = TEST_USERS.find(u => u.email === email)

      if (testAccount && password === testAccount.senha) {
        isPasswordValid = true
      } else if (user.senha_hash === password) {
        isPasswordValid = true
      }

      if (!isPasswordValid) {
        setError('Email ou senha incorretos')
        setIsLoading(false)
        return
      }

      // Atualizar ultimo acesso
      await supabase
        .from('users')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', user.id)

      setUser(user)

      if (user.role === 'administrador') {
        router.push('/admin/dashboard')
      } else {
        router.push('/aluno/dashboard')
      }
    } catch (err) {
      console.error('Erro:', err)
      setError('Erro de conexao. Verifique o console.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4 shadow-lg shadow-primary-500/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Escola-IA</h1>
          <p className="text-gray-400">Plataforma de Treinamentos Online</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass rounded-2xl p-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Acesse sua conta
          </h2>

          {conexaoOk === false && (
            <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Problema de conexao</p>
                <p className="text-xs mt-1">{erroConexao}</p>
                <p className="text-xs mt-1">Verifique .env.local ou src/lib/supabase.ts</p>
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="admin@escola-ia.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11 pr-11"
                  placeholder="admin123"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input type="checkbox" className="rounded border-white/10 bg-surface-light text-primary-500" />
                Lembrar-me
              </label>
              <Link href="/recuperar-senha" className="text-primary-400 hover:text-primary-300">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading || conexaoOk === false}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500">
              Contas de teste:<br/>
              <span className="text-primary-400">admin@escola-ia.com</span> / admin123<br/>
              <span className="text-primary-400">aluno@escola-ia.com</span> / aluno123
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
