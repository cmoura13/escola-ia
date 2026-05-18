'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Download,
  BarChart3,
  Award,
  Clock,
  Target,
} from 'lucide-react'
import AdminHeader from '@/components/admin/Header'
import { supabase } from '@/lib/supabase'

export default function RelatoriosPage() {
  const [stats, setStats] = useState({
    totalAlunos: 0,
    totalCursos: 0,
    totalMatriculas: 0,
    totalConcluidos: 0,
    taxaConclusao: 0,
    alunosAtivos: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setIsLoading(true)
    try {
      const [
        { count: alunos },
        { count: cursos },
        { count: matriculas },
        { count: concluidos },
        { count: ativos },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'aluno'),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'concluido'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'aluno').eq('status', 'ativo'),
      ])

      const taxa = matriculas && matriculas > 0 && concluidos != null
        ? Math.round((concluidos / matriculas) * 100)
        : 0

      setStats({
        totalAlunos: alunos || 0,
        totalCursos: cursos || 0,
        totalMatriculas: matriculas || 0,
        totalConcluidos: concluidos || 0,
        taxaConclusao: taxa,
        alunosAtivos: ativos || 0,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const reportCards = [
    {
      title: 'Alunos Cadastrados',
      value: stats.totalAlunos,
      icon: Users,
      color: 'from-primary-500 to-primary-600',
      description: 'Total de alunos na plataforma',
    },
    {
      title: 'Cursos Ativos',
      value: stats.totalCursos,
      icon: BookOpen,
      color: 'from-accent-500 to-accent-600',
      description: 'Cursos disponíveis para matrícula',
    },
    {
      title: 'Matrículas Realizadas',
      value: stats.totalMatriculas,
      icon: GraduationCap,
      color: 'from-success to-emerald-600',
      description: 'Total de matrículas efetuadas',
    },
    {
      title: 'Cursos Concluídos',
      value: stats.totalConcluidos,
      icon: Award,
      color: 'from-warning to-amber-600',
      description: 'Alunos que finalizaram cursos',
    },
  ]

  return (
    <div className="animate-fade-in">
      <AdminHeader title="Relatórios" subtitle="Métricas e estatísticas da plataforma" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-white">
                  {isLoading ? (
                    <span className="inline-block w-12 h-8 bg-surface-light rounded animate-pulse" />
                  ) : (
                    card.value
                  )}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500">{card.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Desempenho dos Alunos</h3>
            <button className="btn-secondary text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Taxa de Conclusão', value: stats.taxaConclusao, color: 'bg-primary-500' },
              { label: 'Alunos Ativos', value: stats.alunosAtivos > 0 && stats.totalAlunos > 0 ? Math.round((stats.alunosAtivos / stats.totalAlunos) * 100) : 0, color: 'bg-accent-500' },
              { label: 'Engajamento', value: 75, color: 'bg-success' },
              { label: 'Satisfação', value: 88, color: 'bg-warning' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  <span className="text-sm font-medium text-white">{item.value}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${item.color}`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Course Rankings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Cursos Mais Populares</h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>

          <div className="space-y-4">
            {[
              { name: 'Introdução à Programação', students: 45, progress: 78 },
              { name: 'Marketing Digital', students: 38, progress: 65 },
              { name: 'Gestão de Projetos', students: 32, progress: 82 },
              { name: 'Excel Avançado', students: 28, progress: 91 },
              { name: 'Comunicação Empresarial', students: 25, progress: 70 },
            ].map((course, index) => (
              <div key={course.name} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-surface-light flex items-center justify-center text-xs font-medium text-gray-400">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{course.name}</p>
                  <p className="text-xs text-gray-500">{course.students} alunos matriculados</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary-400">{course.progress}%</p>
                  <p className="text-xs text-gray-500">conclusão</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Certificates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card mt-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Certificados Emitidos Recentemente</h3>
          <Award className="w-5 h-5 text-gray-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Aluno</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Curso</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Código</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {[
                { aluno: 'João Silva', curso: 'Introdução à Programação', codigo: 'ESC-A7B3C9D2', data: '12/05/2024' },
                { aluno: 'Maria Santos', curso: 'Marketing Digital', codigo: 'ESC-E4F5G6H7', data: '10/05/2024' },
                { aluno: 'Pedro Costa', curso: 'Gestão de Projetos', codigo: 'ESC-I8J9K0L1', data: '08/05/2024' },
                { aluno: 'Ana Oliveira', curso: 'Excel Avançado', codigo: 'ESC-M2N3O4P5', data: '05/05/2024' },
              ].map((cert, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary-400">{cert.aluno.charAt(0)}</span>
                      </div>
                      <span className="text-sm text-white">{cert.aluno}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{cert.curso}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-surface-light px-2 py-1 rounded text-primary-400">{cert.codigo}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{cert.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
