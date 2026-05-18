'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  PlayCircle,
  CheckCircle,
  Lock,
  ChevronRight,
  Users,
  Target,
  GraduationCap,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Course, Module, Lesson, Progress, Enrollment } from '@/types'
import { cn } from '@/utils'

export default function CursoAlunoPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const { user } = useAuth()

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progressList, setProgressList] = useState<Progress[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) loadData()
  }, [user, courseId])

  async function loadData() {
    setIsLoading(true)
    try {
      const [{ data: courseData }, { data: modulesData }, { data: enrollmentData }] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('modules').select('*').eq('course_id', courseId).order('ordem', { ascending: true }),
        supabase.from('enrollments').select('*').eq('user_id', user?.id).eq('course_id', courseId).single(),
      ])

      if (courseData) setCourse(courseData)
      if (modulesData) setModules(modulesData)
      if (enrollmentData) setEnrollment(enrollmentData)

      // Carregar aulas de todos os módulos
      const allLessons: Lesson[] = []
      for (const mod of modulesData || []) {
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', mod.id)
          .order('ordem', { ascending: true })
        if (lessonsData) allLessons.push(...lessonsData)
      }
      setLessons(allLessons)

      // Carregar progresso do usuário
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user?.id)
        .in('lesson_id', allLessons.map(l => l.id))
      if (progressError) console.error('Erro ao carregar progresso:', progressError)
      if (progressData) setProgressList(progressData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function getLessonProgress(lessonId: string) {
    return progressList.find(p => p.lesson_id === lessonId)
  }

  function getProgressoPercentual() {
    if (lessons.length === 0) return 0
    const concluidas = progressList.filter(p => p.concluida).length
    return Math.round((concluidas * 100) / lessons.length)
  }

  function isLessonLocked(lesson: Lesson, lessonIndex: number) {
    if (lessonIndex === 0) return false
    const prevLesson = lessons[lessonIndex - 1]
    const prevProgress = getLessonProgress(prevLesson.id)
    return !prevProgress?.concluida
  }

  function getFirstIncompleteLesson() {
    for (let i = 0; i < lessons.length; i++) {
      const progress = getLessonProgress(lessons[i].id)
      if (!progress?.concluida) return lessons[i]
    }
    return lessons[0]
  }

  const nivelLabels = {
    basico: { label: 'Básico', color: 'badge-success' },
    intermediario: { label: 'Intermediário', color: 'badge-warning' },
    avancado: { label: 'Avançado', color: 'badge-danger' },
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link href="/aluno/cursos" className="hover:text-white transition-colors">Cursos</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">{course?.titulo}</span>
      </div>

      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden mb-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNMjAgMjBoNHY0aC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={cn('badge', nivelLabels[course?.nivel as keyof typeof nivelLabels]?.color)}>
                  {nivelLabels[course?.nivel as keyof typeof nivelLabels]?.label}
                </span>
                <span className="badge badge-primary">{course?.categoria || 'Geral'}</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{course?.titulo}</h1>
              <p className="text-white/70 max-w-2xl">{course?.descricao}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-white/10">
            <span className="flex items-center gap-2 text-white/80">
              <Clock className="w-4 h-4" />
              {course?.carga_horaria}h de conteúdo
            </span>
            <span className="flex items-center gap-2 text-white/80">
              <BookOpen className="w-4 h-4" />
              {lessons.length} aulas
            </span>
            <span className="flex items-center gap-2 text-white/80">
              <Target className="w-4 h-4" />
              {getProgressoPercentual()}% concluído
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-3 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-white/80 to-white rounded-full transition-all duration-500"
                style={{ width: `${getProgressoPercentual()}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Start/Continue Button */}
      {enrollment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Link
            href={`/aluno/cursos/${courseId}/aulas/${getFirstIncompleteLesson()?.id}`}
            className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4"
          >
            <PlayCircle className="w-6 h-6" />
            {getProgressoPercentual() > 0 ? 'Continuar Curso' : 'Começar Curso'}
          </Link>
        </motion.div>
      )}

      {/* Modules & Lessons */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white mb-4">Conteúdo do Curso</h2>

        {modules.map((mod, modIndex) => {
          const modLessons = lessons.filter(l => l.module_id === mod.id)

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: modIndex * 0.1 }}
              className="card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-400">{modIndex + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{mod.titulo}</h3>
              </div>

              <div className="space-y-2">
                {modLessons.map((lesson, lessonIndex) => {
                  const globalIndex = lessons.findIndex(l => l.id === lesson.id)
                  const lessonProgress = getLessonProgress(lesson.id)
                  const isCompleted = lessonProgress?.concluida || false
                  const isLocked = isLessonLocked(lesson, globalIndex)
                  const isCurrent = !isCompleted && !isLocked && !lessonProgress

                  return (
                    <Link
                      key={lesson.id}
                      href={isLocked ? '#' : `/aluno/cursos/${courseId}/aulas/${lesson.id}`}
                      onClick={(e) => {
                        if (isLocked) {
                          e.preventDefault()
                          alert('Complete a aula anterior para desbloquear esta.')
                        }
                      }}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl transition-all group',
                        isLocked
                          ? 'bg-white/[0.02] cursor-not-allowed'
                          : 'hover:bg-white/[0.04] cursor-pointer'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                        isCompleted
                          ? 'bg-success/20'
                          : isCurrent
                          ? 'bg-primary-500/20'
                          : 'bg-surface-light'
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-gray-600" />
                        ) : (
                          <PlayCircle className="w-5 h-5 text-primary-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-medium truncate',
                          isLocked ? 'text-gray-600' : 'text-white'
                        )}>
                          {lesson.titulo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lesson.duracao_minutos} minutos
                        </p>
                      </div>

                      {isCompleted && lessonProgress?.nota_quiz && (
                        <span className={cn(
                          'badge text-xs',
                          lessonProgress.nota_quiz >= 70 ? 'badge-success' : 'badge-warning'
                        )}>
                          {lessonProgress.nota_quiz}%
                        </span>
                      )}

                      {!isLocked && (
                        <ChevronRight className={cn(
                          'w-4 h-4 transition-colors',
                          isCompleted ? 'text-success' : 'text-primary-400'
                        )} />
                      )}
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
