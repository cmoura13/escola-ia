'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Clock,
  BookOpen,
  FileQuestion,
  Trophy,
  Lock,
  AlertCircle,
  ArrowLeft,
  Home,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Course, Module, Lesson, Quiz, Answer, Progress, Enrollment } from '@/types'
import { cn } from '@/utils'

export default function PlayerAulaPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const lessonId = params.aulaId as string

  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [progressPercentual, setProgressPercentual] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Erro ao alternar tela cheia:', error)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement
      setIsFullscreen(isFull)
      document.documentElement.dataset.playerFullscreen = isFull ? 'true' : ''
      if (isFull) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.documentElement.removeAttribute('data-player-fullscreen')
    }
  }, [])

  useEffect(() => {
    if (user) loadData()
  }, [user, courseId, lessonId])

  async function loadData() {
    setIsLoading(true)
    try {
      // Carregar curso
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()
      if (courseData) setCourse(courseData)

      // Carregar módulos e aulas
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('ordem', { ascending: true })

      let allLessons: Lesson[] = []
      if (modulesData) {
        setModules(modulesData)
        for (const mod of modulesData) {
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*, quizzes(*, answers(*))')
            .eq('module_id', mod.id)
            .order('ordem', { ascending: true })
          if (lessonsData) allLessons.push(...lessonsData)
        }
        setLessons(allLessons)
      }

      // Aula atual
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*, quizzes(*, answers(*))')
        .eq('id', lessonId)
        .single()
      if (lessonData) setCurrentLesson(lessonData)

      // Progresso
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user?.id)
        .eq('lesson_id', lessonId)
        .single()
      if (progressError && progressError.code !== 'PGRST116') console.error('Erro ao carregar progresso da aula:', progressError)
      if (progressData) setProgress(progressData)

      // Progresso percentual do curso
      if (allLessons.length > 0) {
        const { data: completedData, error: completedError } = await supabase
          .from('progress')
          .select('id')
          .eq('user_id', user?.id)
          .in('lesson_id', allLessons.map(l => l.id))
          .eq('concluida', true)
        if (completedError) console.error('Erro ao carregar aulas concluídas:', completedError)
        const pct = Math.round(((completedData?.length || 0) * 100) / allLessons.length)
        setProgressPercentual(pct)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function markAsComplete() {
    try {
      if (progress) {
        await supabase
          .from('progress')
          .update({ concluida: true, data_conclusao: new Date().toISOString() })
          .eq('id', progress.id)
      } else {
        await supabase.from('progress').insert({
          user_id: user?.id,
          lesson_id: lessonId,
          concluida: true,
          data_conclusao: new Date().toISOString(),
        })
      }

      await atualizarProgressoCurso()
      await loadData()
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error)
    }
  }

  async function atualizarProgressoCurso() {
    const totalLessons = lessons.length
    if (totalLessons === 0) return

    const { data: completedData, error: completedError } = await supabase
      .from('progress')
      .select('id')
      .eq('user_id', user?.id)
      .in('lesson_id', lessons.map(l => l.id))
      .eq('concluida', true)
    if (completedError) console.error('Erro ao atualizar progresso:', completedError)

    const completedCount = completedData?.length || 0
    const percentual = Math.round((completedCount * 100) / totalLessons)

    setProgressPercentual(percentual)
  }

  async function submitQuiz() {
    if (!currentLesson?.quizzes) return

    let correct = 0
    const total = currentLesson.quizzes.length

    for (const quiz of currentLesson.quizzes) {
      const selectedAnswer = quizAnswers[quiz.id]
      const correctAnswer = quiz.answers?.find(a => a.correta)
      if (selectedAnswer === correctAnswer?.id) correct++
    }

    const score = Math.round((correct / total) * 100)
    const passed = score >= 70 // Nota mínima 70%

    setQuizResult({ score, passed })

    if (passed) {
      await markAsComplete()
    }

    // Salvar nota
    if (progress) {
      await supabase
        .from('progress')
        .update({ nota_quiz: score, tentativas: (progress.tentativas || 0) + 1 })
        .eq('id', progress.id)
    }
  }

  function getLessonIndex() {
    return lessons.findIndex(l => l.id === lessonId)
  }

  function getPrevLesson() {
    const idx = getLessonIndex()
    return idx > 0 ? lessons[idx - 1] : null
  }

  function getNextLesson() {
    const idx = getLessonIndex()
    // Só permite avançar se a aula atual estiver concluída
    if (!progress?.concluida && currentLesson?.quizzes && currentLesson.quizzes.length > 0) {
      return null
    }
    return idx < lessons.length - 1 ? lessons[idx + 1] : null
  }

  function isLessonAccessible(lesson: Lesson) {
    const idx = lessons.findIndex(l => l.id === lesson.id)
    if (idx === 0) return true
    const prevLesson = lessons[idx - 1]
    // Verificar se a aula anterior está concluída (simplificado)
    return true // Em produção, verificar no banco
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 320 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-screen bg-surface border-r border-white/5 overflow-hidden z-40"
      >
        <div className="w-80 h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/5">
            <Link href="/aluno/cursos" className="flex items-center gap-2 text-gray-400 hover:text-white mb-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Voltar aos cursos</span>
            </Link>
            <h2 className="text-lg font-semibold text-white line-clamp-2">{course?.titulo}</h2>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Progresso</span>
                <span className="text-primary-400 font-medium">{progressPercentual}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentual}%` }}
                />
              </div>
            </div>
          </div>

          {/* Modules & Lessons */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {modules.map((mod) => {
              const modLessons = lessons.filter(l => l.module_id === mod.id)
              return (
                <div key={mod.id}>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">
                    {mod.titulo}
                  </h3>
                  <div className="space-y-1">
                    {modLessons.map((lesson) => {
                      const isCurrent = lesson.id === lessonId
                      const lessonProgress = progress // Simplificado
                      const isCompleted = lessonProgress?.concluida || false

                      return (
                        <Link
                          key={lesson.id}
                          href={`/aluno/cursos/${courseId}/aulas/${lesson.id}`}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm',
                            isCurrent
                              ? 'bg-primary-500/10 text-primary-400 border-r-2 border-primary-500'
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                          ) : isCurrent ? (
                            <Circle className="w-4 h-4 text-primary-400 flex-shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          )}
                          <span className="line-clamp-2 flex-1">{lesson.titulo}</span>
                          <span className="text-xs text-gray-600 flex-shrink-0">{lesson.duracao_minutos}min</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{ marginLeft: sidebarOpen ? 320 : 0 }}>
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-white/5 px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            {getPrevLesson() && (
              <Link
                href={`/aluno/cursos/${courseId}/aulas/${getPrevLesson()!.id}`}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Link>
            )}
            <span className="text-sm text-gray-500">
              Aula {getLessonIndex() + 1} de {lessons.length}
            </span>
            {getNextLesson() && (
              <Link
                href={`/aluno/cursos/${courseId}/aulas/${getNextLesson()!.id}`}
                className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-white mb-6">{currentLesson?.titulo}</h1>

            {/* Content */}
            {currentLesson?.conteudo_html ? (
              <div
                className="prose prose-invert max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: currentLesson.conteudo_html }}
              />
            ) : (
              <div className="card py-16 text-center mb-8">
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Esta aula ainda não possui conteúdo.</p>
              </div>
            )}

            {/* Quiz Section */}
            {currentLesson?.quizzes && currentLesson.quizzes.length > 0 && (
              <div className="card mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
                    <FileQuestion className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Questionário</h3>
                    <p className="text-sm text-gray-400">Responda para liberar a próxima aula (mínimo 70%)</p>
                  </div>
                </div>

                {!quizResult ? (
                  <div className="space-y-6">
                    {currentLesson.quizzes.map((quiz, qIndex) => (
                      <div key={quiz.id} className="space-y-3">
                        <p className="text-white font-medium">
                          {qIndex + 1}. {quiz.pergunta}
                        </p>
                        <div className="space-y-2">
                          {quiz.answers?.map((answer) => (
                            <label
                              key={answer.id}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer',
                                quizAnswers[quiz.id] === answer.id
                                  ? 'border-primary-500/50 bg-primary-500/10'
                                  : 'border-white/5 hover:border-white/10 bg-white/[0.02]'
                              )}
                            >
                              <input
                                type="radio"
                                name={quiz.id}
                                value={answer.id}
                                checked={quizAnswers[quiz.id] === answer.id}
                                onChange={() => setQuizAnswers({ ...quizAnswers, [quiz.id]: answer.id })}
                                className="w-4 h-4 accent-primary-500"
                              />
                              <span className="text-sm text-gray-300">{answer.alternativa}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length !== currentLesson.quizzes.length}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Enviar Respostas
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    {quizResult.passed ? (
                      <>
                        <Trophy className="w-16 h-16 text-success mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-success mb-2">Parabéns!</h4>
                        <p className="text-gray-400 mb-4">
                          Você acertou {quizResult.score}% das questões. Próxima aula liberada!
                        </p>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
                        <h4 className="text-xl font-semibold text-warning mb-2">Quase lá!</h4>
                        <p className="text-gray-400 mb-4">
                          Você acertou {quizResult.score}%. É necessário 70% para avançar.
                        </p>
                        <button
                          onClick={() => {
                            setQuizResult(null)
                            setQuizAnswers({})
                          }}
                          className="btn-secondary"
                        >
                          Tentar Novamente
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Complete Button (if no quiz) */}
            {(!currentLesson?.quizzes || currentLesson.quizzes.length === 0) && !progress?.concluida && (
              <button
                onClick={markAsComplete}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-8"
              >
                <CheckCircle className="w-5 h-5" />
                Marcar como Concluído
              </button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              {getPrevLesson() ? (
                <Link
                  href={`/aluno/cursos/${courseId}/aulas/${getPrevLesson()!.id}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Anterior</p>
                    <p className="text-sm font-medium">{getPrevLesson()!.titulo}</p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {getNextLesson() ? (
                <Link
                  href={`/aluno/cursos/${courseId}/aulas/${getNextLesson()!.id}`}
                  className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Próxima</p>
                    <p className="text-sm font-medium">{getNextLesson()!.titulo}</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/aluno/certificados"
                  className="flex items-center gap-2 text-accent-400 hover:text-accent-300 transition-colors"
                >
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Curso Concluído!</p>
                    <p className="text-sm font-medium">Ver Certificado</p>
                  </div>
                  <Trophy className="w-5 h-5" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
