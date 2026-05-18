'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Clock,
  Award,
  Users,
  PlayCircle,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Course, Enrollment, Progress } from '@/types'
import { cn } from '@/utils'

export default function AlunoCursosPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [progressPerCourse, setProgressPerCourse] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterNivel, setFilterNivel] = useState<string>('todos')

  useEffect(() => {
    loadData()
  }, [user])

  async function loadData() {
    setIsLoading(true)
    try {
      const [{ data: coursesData }, { data: enrollmentsData }] = await Promise.all([
        supabase.from('courses').select('*').eq('status', 'ativo').order('created_at', { ascending: false }),
        supabase.from('enrollments').select('*').eq('user_id', user?.id),
      ])

      if (coursesData) setCourses(coursesData)
      if (enrollmentsData) {
        setEnrollments(enrollmentsData)

        // Calcular progresso localmente para cada curso matriculado
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

              const { data: progressData } = await supabase
                .from('progress')
                .select('lesson_id, concluida')
                .eq('user_id', user?.id)
                .in('lesson_id', lessonIds)

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
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleMatricula(courseId: string) {
    try {
      const { error } = await supabase.from('enrollments').insert({
        user_id: user?.id,
        course_id: courseId,
      })
      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Erro ao matricular:', error)
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.titulo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesNivel = filterNivel === 'todos' || course.nivel === filterNivel
    return matchesSearch && matchesNivel
  })

  const isEnrolled = (courseId: string) => enrollments.some(e => e.course_id === courseId)
  const getEnrollment = (courseId: string) => enrollments.find(e => e.course_id === courseId)

  const nivelLabels = {
    basico: { label: 'Básico', color: 'badge-success' },
    intermediario: { label: 'Intermediário', color: 'badge-warning' },
    avancado: { label: 'Avançado', color: 'badge-danger' },
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cursos Disponíveis</h1>
        <p className="text-gray-400">Explore nossos cursos e comece sua jornada de aprendizado</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar curso..."
              className="input-field pl-10 text-sm"
            />
          </div>
          <select
            value={filterNivel}
            onChange={(e) => setFilterNivel(e.target.value)}
            className="input-field text-sm py-2.5"
          >
            <option value="todos">Todos os níveis</option>
            <option value="basico">Básico</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-80 animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="card py-16 text-center">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum curso encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const enrolled = isEnrolled(course.id)
            const enrollment = getEnrollment(course.id)

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card card-hover group flex flex-col"
              >
                {/* Cover */}
                <div className="relative h-44 -mx-6 -mt-6 mb-4 rounded-t-xl overflow-hidden bg-gradient-to-br from-primary-600 to-accent-600">
                  {course.capa_url ? (
                    <img src={course.capa_url} alt={course.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <span className={cn('badge', nivelLabels[course.nivel as keyof typeof nivelLabels]?.color)}>
                      {nivelLabels[course.nivel as keyof typeof nivelLabels]?.label}
                    </span>
                  </div>
                  {enrolled && (
                    <div className="absolute top-3 right-3">
                      <span className="badge badge-primary">Matriculado</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{course.titulo}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">{course.descricao}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.carga_horaria}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    {course.categoria || 'Geral'}
                  </span>
                </div>

                {enrolled && enrollment ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progresso</span>
                      <span className="text-white font-medium">{progressPerCourse[course.id] ?? enrollment.progresso_percentual}%</span>
                    </div>
                    <div className="progress-bar h-2">
                      <div
                        className="progress-fill h-2"
                        style={{ width: `${progressPerCourse[course.id] ?? enrollment.progresso_percentual}%` }}
                      />
                    </div>
                    <Link
                      href={`/aluno/cursos/${course.id}`}
                      className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                    >
                      <PlayCircle className="w-4 h-4" />
                      {(progressPerCourse[course.id] ?? enrollment.progresso_percentual) > 0 ? 'Continuar' : 'Começar'}
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => handleMatricula(course.id)}
                    className="btn-accent w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <BookOpen className="w-4 h-4" />
                    Matricular-se
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
