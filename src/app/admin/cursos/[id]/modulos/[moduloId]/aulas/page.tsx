'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  PlayCircle,
  FileQuestion,
  X,
  Save,
  GripVertical,
  CheckCircle,
  Clock,
} from 'lucide-react'
import AdminHeader from '@/components/admin/Header'
import TiptapEditor from '@/components/editor/TiptapEditor'
import { supabase } from '@/lib/supabase'
import { Course, Module, Lesson, Quiz, Answer } from '@/types'
import { cn } from '@/utils'

export default function AulasPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const moduleId = params.moduloId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    titulo: '',
    conteudo_html: '',
    duracao_minutos: 0,
    ordem: 0,
  })

  const [quizData, setQuizData] = useState({
    pergunta: '',
    alternativas: [
      { texto: '', correta: true },
      { texto: '', correta: false },
      { texto: '', correta: false },
      { texto: '', correta: false },
    ],
  })

  useEffect(() => {
    loadData()
  }, [courseId, moduleId])

  async function loadData() {
    setIsLoading(true)
    try {
      const [{ data: courseData }, { data: moduleData }, { data: lessonsData }] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('modules').select('*').eq('id', moduleId).single(),
        supabase.from('lessons').select('*, quizzes(*, answers(*))').eq('module_id', moduleId).order('ordem', { ascending: true }),
      ])

      if (courseData) setCourse(courseData)
      if (moduleData) setModule(moduleData)
      if (lessonsData) setLessons(lessonsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingLesson) {
        const { error } = await supabase
          .from('lessons')
          .update({
            titulo: formData.titulo,
            conteudo_html: formData.conteudo_html,
            duracao_minutos: formData.duracao_minutos,
            ordem: formData.ordem,
          })
          .eq('id', editingLesson.id)
        if (error) throw error
      } else {
        const maxOrdem = lessons.length > 0 ? Math.max(...lessons.map(l => l.ordem)) : -1
        const { error } = await supabase.from('lessons').insert({
          module_id: moduleId,
          titulo: formData.titulo,
          conteudo_html: formData.conteudo_html,
          duracao_minutos: formData.duracao_minutos,
          ordem: maxOrdem + 1,
        })
        if (error) throw error
      }
      await loadData()
      setShowModal(false)
      setEditingLesson(null)
    } catch (error) {
      console.error('Erro ao salvar aula:', error)
    }
  }

  async function handleDelete(lessonId: string) {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) return
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Erro ao excluir aula:', error)
    }
  }

  async function handleQuizSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedLessonForQuiz) return

    try {
      // Criar quiz
      const { data: quizData_result, error: quizError } = await supabase
        .from('quizzes')
        .insert({ lesson_id: selectedLessonForQuiz, pergunta: quizData.pergunta })
        .select()
        .single()

      if (quizError) throw quizError

      // Criar alternativas
      const answers = quizData.alternativas.map((alt, index) => ({
        quiz_id: quizData_result.id,
        alternativa: alt.texto,
        correta: alt.correta,
        ordem: index,
      }))

      const { error: answersError } = await supabase.from('answers').insert(answers)
      if (answersError) throw answersError

      setShowQuizModal(false)
      setSelectedLessonForQuiz(null)
      setQuizData({
        pergunta: '',
        alternativas: [
          { texto: '', correta: true },
          { texto: '', correta: false },
          { texto: '', correta: false },
          { texto: '', correta: false },
        ],
      })
      await loadData()
    } catch (error) {
      console.error('Erro ao salvar quiz:', error)
    }
  }

  function openModal(lesson?: Lesson) {
    if (lesson) {
      setEditingLesson(lesson)
      setFormData({
        titulo: lesson.titulo,
        conteudo_html: lesson.conteudo_html || '',
        duracao_minutos: lesson.duracao_minutos,
        ordem: lesson.ordem,
      })
    } else {
      setEditingLesson(null)
      setFormData({
        titulo: '',
        conteudo_html: '',
        duracao_minutos: 0,
        ordem: lessons.length,
      })
    }
    setShowModal(true)
  }

  function openQuizModal(lessonId: string) {
    setSelectedLessonForQuiz(lessonId)
    setShowQuizModal(true)
  }

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <Link href="/admin/cursos" className="hover:text-white transition-colors">Cursos</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/admin/cursos/${courseId}/modulos`} className="hover:text-white transition-colors">Módulos</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">{module?.titulo || 'Carregando...'}</span>
      </div>

      <AdminHeader
        title="Aulas do Módulo"
        subtitle={`Gerencie as aulas de "${module?.titulo || ''}"`}
      />

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push(`/admin/cursos/${courseId}/modulos`)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos módulos
        </button>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Aula
        </button>
      </div>

      {/* Lessons List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <div className="card py-16 text-center">
          <PlayCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Nenhuma aula criada</p>
          <p className="text-sm text-gray-600">Clique em "Nova Aula" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-lg font-bold text-primary-400">{index + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-white">{lesson.titulo}</h3>
                    {lesson.quizzes && lesson.quizzes.length > 0 && (
                      <span className="badge badge-primary flex items-center gap-1">
                        <FileQuestion className="w-3 h-3" />
                        {lesson.quizzes.length} quiz{lesson.quizzes.length > 1 ? 'zes' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {lesson.duracao_minutos} min
                    </span>
                    <span>{lesson.conteudo_html ? 'Conteúdo HTML' : 'Sem conteúdo'}</span>
                  </div>

                  {/* Preview de quizzes */}
                  {lesson.quizzes && lesson.quizzes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {lesson.quizzes.map((quiz) => (
                        <div key={quiz.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <p className="text-sm text-gray-300 mb-2">{quiz.pergunta}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {quiz.answers?.map((answer, idx) => (
                              <div
                                key={answer.id}
                                className={cn(
                                  'text-xs px-2 py-1.5 rounded',
                                  answer.correta
                                    ? 'bg-success/10 text-success border border-success/20'
                                    : 'bg-surface-light text-gray-400 border border-white/5'
                                )}
                              >
                                {String.fromCharCode(65 + idx)}. {answer.alternativa}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openQuizModal(lesson.id)}
                    className="p-2 rounded-lg hover:bg-primary-500/10 text-gray-400 hover:text-primary-400"
                    title="Adicionar Quiz"
                  >
                    <FileQuestion className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openModal(lesson)}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="p-2 rounded-lg hover:bg-danger/10 text-gray-400 hover:text-danger"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Aula */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingLesson ? 'Editar Aula' : 'Nova Aula'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Título da Aula *</label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className="input-field"
                      placeholder="Ex: Introdução ao Tema"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Duração (minutos)</label>
                    <input
                      type="number"
                      value={formData.duracao_minutos}
                      onChange={(e) => setFormData({ ...formData, duracao_minutos: parseInt(e.target.value) || 0 })}
                      className="input-field"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Conteúdo da Aula</label>
                  <TiptapEditor
                    content={formData.conteudo_html}
                    onChange={(content) => setFormData({ ...formData, conteudo_html: content })}
                    placeholder="Escreva o conteúdo da aula aqui..."
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    {editingLesson ? 'Salvar Alterações' : 'Criar Aula'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Quiz */}
      <AnimatePresence>
        {showQuizModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowQuizModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Adicionar Questionário</h2>
                <button onClick={() => setShowQuizModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleQuizSubmit} className="space-y-4">
                <div>
                  <label className="label">Pergunta *</label>
                  <input
                    type="text"
                    value={quizData.pergunta}
                    onChange={(e) => setQuizData({ ...quizData, pergunta: e.target.value })}
                    className="input-field"
                    placeholder="Digite a pergunta..."
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="label">Alternativas (marque a correta)</label>
                  {quizData.alternativas.map((alt, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correta"
                        checked={alt.correta}
                        onChange={() => {
                          const newAlts = quizData.alternativas.map((a, i) => ({ ...a, correta: i === index }))
                          setQuizData({ ...quizData, alternativas: newAlts })
                        }}
                        className="w-4 h-4 accent-primary-500"
                      />
                      <input
                        type="text"
                        value={alt.texto}
                        onChange={(e) => {
                          const newAlts = [...quizData.alternativas]
                          newAlts[index].texto = e.target.value
                          setQuizData({ ...quizData, alternativas: newAlts })
                        }}
                        className="input-field flex-1"
                        placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Questionário
                  </button>
                  <button type="button" onClick={() => setShowQuizModal(false)} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
