'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  Star,
  Zap,
  Shield,
} from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Cursos Ilimitados',
      description: 'Acesse uma vasta biblioteca de cursos profissionais em diversas áreas.',
    },
    {
      icon: PlayCircle,
      title: 'Aulas Interativas',
      description: 'Conteúdo multimídia com editor HTML avançado e recursos visuais.',
    },
    {
      icon: Award,
      title: 'Certificados Válidos',
      description: 'Receba certificados com código de validação ao concluir cada curso.',
    },
    {
      icon: Zap,
      title: 'Progresso Inteligente',
      description: 'Acompanhamento em tempo real do seu desenvolvimento e desempenho.',
    },
    {
      icon: Shield,
      title: 'Plataforma Segura',
      description: 'Seus dados protegidos com criptografia e autenticação JWT.',
    },
    {
      icon: Users,
      title: 'Comunidade Ativa',
      description: 'Conecte-se com outros alunos e compartilhe conhecimento.',
    },
  ]

  const stats = [
    { value: '50+', label: 'Cursos Disponíveis' },
    { value: '1000+', label: 'Alunos Matriculados' },
    { value: '95%', label: 'Taxa de Aprovação' },
    { value: '4.9', label: 'Avaliação Média' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gradient">Escola-IA</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/login"
                className="btn-primary text-sm"
              >
                Começar Agora
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                Plataforma de Treinamentos Online
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Aprenda sem limites com a{' '}
                <span className="text-gradient">Escola-IA</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                Cursos profissionais, treinamentos corporativos e educacionais em uma plataforma 
                moderna, segura e com certificação válida.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                  Acessar Plataforma
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login" className="btn-secondary text-lg px-8 py-4">
                  Criar Conta
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold text-gradient mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Por que escolher a Escola-IA?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Uma plataforma completa pensada para oferecer a melhor experiência de aprendizado online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-accent-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNMjAgMjBoNHY0aC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

            <div className="relative p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Pronto para começar sua jornada?
              </h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto">
                Acesse agora a plataforma e explore todos os cursos disponíveis. 
                Seu futuro profissional começa aqui.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all"
              >
                Acessar Escola-IA
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-gradient">Escola-IA</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 Escola-IA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
