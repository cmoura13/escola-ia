'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  PlayCircle,
  ChevronRight,
  Flame,
  Target,
  Star,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Enrollment, Course, Progress } from '@/types'
import { formatDate } from '@/utils'

export default function AlunoDashboardPage() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<(Enrollment & { course: Course })[]>([])
  const [recentProgress, setRecentProgress] = useState<Progress[]>([])
  const [progressPerCourse, setProgressPerCourse] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) loadData()
  }, [user])

  async function loadData() {
    setIsLoading(true)
    try {
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select('*, course:courses(*)')
        .eq('user_id', user?.id)
        .order('data_matricula', { ascending: false })

      if (enrollmentsData) {
        setEnrollments(enrollmentsData)

        // Calcular progresso localmente
        const enrolledCourseIds = enrollmentsData.map(e => e.course_id)
        if (enrolledCourseIds.length > 0 && user?.id) {
          const { data: modulesData } = await supabase
            .from('modules')
            .select('id, course_id')
            .in('course_id', enrolledCourseIds)

          if (modulesData) {
            const moduleIds = modulesData.map(m => m.id)
            const courseModules = modulesData.reduce<Record<string, string[]>>((acc, m) => {
              acc[m.course_id] = acc[m.course_id] || []
              acc[m.course_id].push(m.id)
              return acc
            }, {} as Record<string, string[]>)

            const { data: lessonsData } = await supabase
              .from('lessons')
              .select('id, module_id')
              .in('module_id', moduleIds)

            if (lessonsData) {
              const lessonIds = lessonsData.map(l => l.id)
              const moduleLessons = lessonsData.reduce<Record<string, string[]>>((acc, l) => {
                acc[l.module_id] = acc[l.module_id] || []
                acc[l.module_id].push(l.id)
                return acc
              }, {} as Record<string, string[]>)

              const { data: progressData, error: progressError } = await supabase
                .from('progress')
                .select('lesson_id, concluida')
                .eq('user_id', user?.id)
                .in('lesson_id', lessonIds)
              if (progressError) console.error('Erro ao carregar progresso:', progressError)

              const completedLessonIds = new Set(
                (progressData || []).filter(p => p.concluida).map(p => p.lesson_id)
              )

              const pcts: Record<string, number> = {}
              for (const courseId of enrolledCourseIds) {
                const modIds = courseModules[courseId] || []
                let total = 0
                let completed = 0
                for (const modId of modIds) {
                  const lesIds = moduleLessons[modId] || []
                  total += lesIds.length
                  completed += lesIds.filter(id => completedLessonIds.has(id)).length
                }
                pcts[courseId] = total > 0 ? Math.round((completed * 100) / total) : 0
              }
              setProgressPerCourse(pcts)
            }
          }
        }
      }

      const { data: progressData, error: recentError } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })
        .limit(5)
      if (recentError) console.error('Erro ao carregar progresso recente:', recentError)

      if (progressData) setRecentProgress(progressData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function getPct(enrollmentId: string) {
    const e = enrollments.find(en => en.id === enrollmentId)
    if (!e) return 0
    return progressPerCourse[e.course_id] ?? e.progresso_percentual
  }

  const emAndamento = enrollments.filter(e => (progressPerCourse[e.course_id] ?? e.progresso_percentual) < 100).length
  const concluidos = enrollments.filter(e => (progressPerCourse[e.course_id] ?? e.progresso_percentual) >= 100).length

  const stats = [
    { label: 'Cursos em Andamento', value: emAndamento, icon: BookOpen, color: 'from-primary-500 to-primary-600' },
    { label: 'Cursos Concluídos', value: concluidos, icon: Award, color: 'from-accent-500 to-accent-600' },
    { label: 'Certificados', value: concluidos, icon: Star, color: 'from-success to-emerald-600' },
    { label: 'Horas de Estudo', value: '24h', icon: Clock, color: 'from-warning to-amber-600' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Olá, <span className="text-gradient">{user?.nome?.split(' ')[0] || 'Aluno'}</span>! 👋
        </h1>
        <p className="text-gray-400">Continue sua jornada de aprendizado. Você está indo muito bem!</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">
                {isLoading ? <span className="inline-block w-8 h-6 bg-surface-light rounded animate-pulse" /> : stat.value}
              </p>
            </div>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Continue Aprendendo</h2>
            <Link href="/aluno/cursos" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card h-32 animate-pulse" />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="card py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Você ainda não está matriculado em nenhum curso</p>
              <Link href="/aluno/cursos" className="btn-primary inline-flex items-center gap-2 mt-4">
                Explorar Cursos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.slice(0, 3).map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card card-hover group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-white/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1">{enrollment.course?.titulo}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          {progressPerCourse[enrollment.course_id] ?? enrollment.progresso_percentual}% concluído
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {enrollment.course?.carga_horaria}h
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 progress-bar h-2">
                          <div
                            className="progress-fill h-2"
                            style={{ width: `${progressPerCourse[enrollment.course_id] ?? enrollment.progresso_percentual}%` }}
                          />
                        </div>
                        <Link
                          href={`/aluno/cursos/${enrollment.course_id}`}
                          className="btn-primary text-sm flex items-center gap-2 flex-shrink-0"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Continuar
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Sidebar Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Next Lessons */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Próximas Aulas</h3>
            <div className="space-y-3">
              {[
                { title: 'Variáveis e Tipos de Dados', course: 'Introdução à Programação', time: '15 min' },
                { title: 'Estruturas Condicionais', course: 'Introdução à Programação', time: '20 min' },
                { title: 'Funções e Escopo', course: 'JavaScript Avançado', time: '25 min' },
              ].map((lesson, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{lesson.title}</p>
                    <p className="text-xs text-gray-500">{lesson.course}</p>
                  </div>
                  <span className="text-xs text-gray-500">{lesson.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Conquistas</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Flame, label: '3 dias seguidos', color: 'text-orange-400' },
                { icon: Award, label: '1º Certificado', color: 'text-yellow-400' },
                { icon: Star, label: '5 Aulas', color: 'text-purple-400' },
              ].map((achievement, index) => (
                <div key={index} className="text-center p-3 rounded-xl bg-white/[0.02]">
                  <achievement.icon className={`w-6 h-6 ${achievement.color} mx-auto mb-2`} />
                  <p className="text-xs text-gray-500">{achievement.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
