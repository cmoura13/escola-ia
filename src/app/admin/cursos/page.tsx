'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Clock,
  BarChart3,
  Users,
  X,
  ChevronRight,
  BookOpen,
  Layers,
  PlayCircle,
  Award,
} from 'lucide-react'
import AdminHeader from '@/components/admin/Header'
import { supabase } from '@/lib/supabase'
import { Course } from '@/types'
import { formatDate } from '@/utils'
import { cn } from '@/utils'

export default function CursosPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    carga_horaria: 0,
    nivel: 'basico' as 'basico' | 'intermediario' | 'avancado',
    categoria: '',
    status: 'ativo' as const,
    capa_url: '',
  })

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, professor:users(nome)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update({
            titulo: formData.titulo,
            descricao: formData.descricao,
            carga_horaria: formData.carga_horaria,
            nivel: formData.nivel,
            categoria: formData.categoria,
            status: formData.status,
            capa_url: formData.capa_url,
          })
          .eq('id', editingCourse.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('courses').insert({
          titulo: formData.titulo,
          descricao: formData.descricao,
          carga_horaria: formData.carga_horaria,
          nivel: formData.nivel,
          categoria: formData.categoria,
          status: formData.status,
          capa_url: formData.capa_url,
        })

        if (error) throw error
      }

      await loadCourses()
      setShowModal(false)
      setEditingCourse(null)
    } catch (error) {
      console.error('Erro ao salvar curso:', error)
      alert('Erro ao salvar curso')
    }
  }

  async function handleDelete(courseId: string) {
    if (!confirm('Tem certeza que deseja excluir este curso? Todos os módulos e aulas serão perdidos.')) return
    try {
      const { error } = await supabase.from('courses').delete().eq('id', courseId)
      if (error) throw error
      await loadCourses()
    } catch (error) {
      console.error('Erro ao excluir curso:', error)
    }
  }

  function openModal(course?: Course) {
    if (course) {
      setEditingCourse(course)
      setFormData({
        titulo: course.titulo,
        descricao: course.descricao || '',
        carga_horaria: course.carga_horaria,
        nivel: (course.nivel || 'basico') as any,
        categoria: course.categoria || '',
        status: course.status as any,
        capa_url: course.capa_url || '',
      })
    } else {
      setEditingCourse(null)
      setFormData({
        titulo: '',
        descricao: '',
        carga_horaria: 0,
        nivel: 'basico',
        categoria: '',
        status: 'ativo',
        capa_url: '',
      })
    }
    setShowModal(true)
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.titulo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || course.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const nivelLabels = {
    basico: { label: 'Básico', color: 'badge-success' },
    intermediario: { label: 'Intermediário', color: 'badge-warning' },
    avancado: { label: 'Avançado', color: 'badge-danger' },
  }

  const statusLabels = {
    ativo: { label: 'Ativo', color: 'badge-success' },
    inativo: { label: 'Inativo', color: 'badge-danger' },
    rascunho: { label: 'Rascunho', color: 'badge-warning' },
  }

  return (
    <div className="animate-fade-in">
      <AdminHeader title="Cursos" subtitle="Gerencie todos os cursos da plataforma" />

      {/* Toolbar */}
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field text-sm py-2.5"
          >
            <option value="todos">Todos</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="rascunho">Rascunho</option>
          </select>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Curso
        </button>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="card py-16 text-center">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum curso encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card card-hover group"
            >
              {/* Course Cover */}
              <div className="relative h-40 -mx-6 -mt-6 mb-4 rounded-t-xl overflow-hidden bg-gradient-to-br from-primary-600 to-accent-600">
                {course.capa_url ? (
                  <img src={course.capa_url} alt={course.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-12 h-12 text-white/30" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={cn('badge', statusLabels[course.status as keyof typeof statusLabels]?.color)}>
                    {statusLabels[course.status as keyof typeof statusLabels]?.label}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className={cn('badge', nivelLabels[course.nivel as keyof typeof nivelLabels]?.color)}>
                    {nivelLabels[course.nivel as keyof typeof nivelLabels]?.label}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{course.titulo}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.descricao}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {course.carga_horaria}h
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  0 alunos
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  {course.categoria || 'Geral'}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <Link
                  href={`/admin/cursos/${course.id}/modulos`}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  Módulos
                </Link>
                <button
                  onClick={() => openModal(course)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-2 rounded-lg hover:bg-danger/10 text-gray-400 hover:text-danger transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
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
              className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingCourse ? 'Editar Curso' : 'Novo Curso'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Título *</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="input-field min-h-[100px] resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Carga Horária (horas)</label>
                    <input
                      type="number"
                      value={formData.carga_horaria}
                      onChange={(e) => setFormData({ ...formData, carga_horaria: parseInt(e.target.value) || 0 })}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="label">Nível</label>
                    <select
                      value={formData.nivel}
                      onChange={(e) => setFormData({ ...formData, nivel: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="basico">Básico</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Categoria</label>
                    <input
                      type="text"
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="input-field"
                      placeholder="Ex: Tecnologia"
                    />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="rascunho">Rascunho</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">URL da Capa</label>
                  <input
                    type="url"
                    value={formData.capa_url}
                    onChange={(e) => setFormData({ ...formData, capa_url: e.target.value })}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingCourse ? 'Salvar Alterações' : 'Criar Curso'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
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
