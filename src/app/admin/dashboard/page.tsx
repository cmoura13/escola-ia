'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Activity,
  Clock,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import AdminHeader from '@/components/admin/Header'
import { supabase } from '@/lib/supabase'
import { DashboardStats } from '@/types'

const statsCards = [
  { label: 'Total de Alunos', icon: Users, color: 'from-primary-500 to-primary-600', key: 'totalAlunos' },
  { label: 'Cursos Ativos', icon: BookOpen, color: 'from-accent-500 to-accent-600', key: 'totalCursos' },
  { label: 'Matrículas', icon: GraduationCap, color: 'from-success to-emerald-600', key: 'totalMatriculas' },
  { label: 'Taxa de Conclusão', icon: TrendingUp, color: 'from-warning to-amber-600', key: 'taxaConclusao', suffix: '%' },
]

const recentActivities = [
  { user: 'João Silva', action: 'concluiu o curso', target: 'Introdução à Programação', time: '2 min atrás', icon: Award },
  { user: 'Maria Santos', action: 'se matriculou em', target: 'Marketing Digital', time: '15 min atrás', icon: GraduationCap },
  { user: 'Pedro Costa', action: 'completou a aula', target: 'Módulo 3 - CSS Avançado', time: '1 hora atrás', icon: BookOpen },
  { user: 'Ana Oliveira', action: 'respondeu o quiz de', target: 'JavaScript Básico', time: '2 horas atrás', icon: Activity },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    totalCursos: 0,
    totalMatriculas: 0,
    taxaConclusao: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [{ count: alunos }, { count: cursos }, { count: matriculas }] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'aluno'),
          supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
          supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        ])

        const { count: concluidos } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'concluido')

        const taxa = matriculas && matriculas > 0 && concluidos != null
          ? Math.round((concluidos / matriculas) * 100)
          : 0

        setStats({
          totalAlunos: alunos || 0,
          totalCursos: cursos || 0,
          totalMatriculas: matriculas || 0,
          taxaConclusao: taxa,
        })
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="animate-fade-in">
      <AdminHeader
        title="Dashboard"
        subtitle="Visão geral da plataforma"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card card-hover"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-white">
                  {isLoading ? (
                    <span className="inline-block w-12 h-8 bg-surface-light rounded animate-pulse" />
                  ) : (
                    <>
                      {stats[card.key as keyof DashboardStats]}
                      {card.suffix}
                    </>
                  )}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <ArrowUpRight className="w-4 h-4 text-success" />
              <span className="text-success font-medium">+12%</span>
              <span className="text-gray-500">vs mês anterior</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Atividades Recentes</h3>
            <button className="text-sm text-primary-400 hover:text-primary-300">Ver todas</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <activity.icon className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200">
                    <span className="font-medium text-white">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className="text-primary-400">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Desempenho</h3>
          <div className="space-y-6">
            {[
              { label: 'Alunos Ativos', value: 78, total: 100, color: 'bg-primary-500' },
              { label: 'Cursos em Andamento', value: 45, total: 60, color: 'bg-accent-500' },
              { label: 'Taxa de Aprovação', value: 92, total: 100, color: 'bg-success' },
              { label: 'Satisfação', value: 88, total: 100, color: 'bg-warning' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  <span className="text-sm font-medium text-white">{item.value}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${item.color}`}
                    style={{ width: `${(item.value / item.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
