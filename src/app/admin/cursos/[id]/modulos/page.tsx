'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  ChevronRight,
  Layers,
  BookOpen,
  X,
  Save,
  PlayCircle,
  FileQuestion,
} from 'lucide-react'
import AdminHeader from '@/components/admin/Header'
import { supabase } from '@/lib/supabase'
import { Course, Module } from '@/types'
import { cn } from '@/utils'

export default function ModulosPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [formData, setFormData] = useState({ titulo: '', ordem: 0 })

  useEffect(() => {
    loadData()
  }, [courseId])

  async function loadData() {
    setIsLoading(true)
    try {
      const [{ data: courseData }, { data: modulesData }] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('modules').select('*').eq('course_id', courseId).order('ordem', { ascending: true }),
      ])

      if (courseData) setCourse(courseData)
      if (modulesData) setModules(modulesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingModule) {
        const { error } = await supabase
          .from('modules')
          .update({ titulo: formData.titulo, ordem: formData.ordem })
          .eq('id', editingModule.id)
        if (error) throw error
      } else {
        const maxOrdem = modules.length > 0 ? Math.max(...modules.map(m => m.ordem)) : -1
        const { error } = await supabase.from('modules').insert({
          course_id: courseId,
          titulo: formData.titulo,
          ordem: maxOrdem + 1,
        })
        if (error) throw error
      }
      await loadData()
      setShowModal(false)
      setEditingModule(null)
    } catch (error) {
      console.error('Erro ao salvar módulo:', error)
    }
  }

  async function handleDelete(moduleId: string) {
    if (!confirm('Tem certeza que deseja excluir este módulo? Todas as aulas serão perdidas.')) return
    try {
      const { error } = await supabase.from('modules').delete().eq('id', moduleId)
      if (error) throw error
      await loadData()
    } catch (error) {
      console.error('Erro ao excluir módulo:', error)
    }
  }

  async function handleReorder(newOrder: Module[]) {
    setModules(newOrder)
    try {
      for (let i = 0; i < newOrder.length; i++) {
        await supabase.from('modules').update({ ordem: i }).eq('id', newOrder[i].id)
      }
    } catch (error) {
      console.error('Erro ao reordenar:', error)
    }
  }

  function openModal(module?: Module) {
    if (module) {
      setEditingModule(module)
      setFormData({ titulo: module.titulo, ordem: module.ordem })
    } else {
      setEditingModule(null)
      setFormData({ titulo: '', ordem: modules.length })
    }
    setShowModal(true)
  }

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <Link href="/admin/cursos" className="hover:text-white transition-colors">Cursos</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">{course?.titulo || 'Carregando...'}</span>
      </div>

      <AdminHeader
        title="Módulos do Curso"
        subtitle={`Organize as unidades de "${course?.titulo || ''}"`}
      />

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/admin/cursos')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos cursos
        </button>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Módulo
        </button>
      </div>

      {/* Modules List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-20 animate-pulse" />
          ))}
        </div>
      ) : modules.length === 0 ? (
        <div className="card py-16 text-center">
          <Layers className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Nenhum módulo criado</p>
          <p className="text-sm text-gray-600">Clique em "Novo Módulo" para começar</p>
        </div>
      ) : (
        <Reorder.Group axis="y" values={modules} onReorder={handleReorder} className="space-y-3">
          {modules.map((module, index) => (
            <Reorder.Item key={module.id} value={module}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card group hover:border-primary-500/30"
              >
                <div className="flex items-center gap-4">
                  <div className="cursor-grab active:cursor-grabbing p-1 text-gray-600 hover:text-gray-400">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary-400">{index + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white">{module.titulo}</h3>
                    <p className="text-sm text-gray-500">Módulo {index + 1} de {modules.length}</p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/admin/cursos/${courseId}/modulos/${module.id}/aulas`}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Aulas
                    </Link>
                    <button
                      onClick={() => openModal(module)}
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(module.id)}
                      className="p-2 rounded-lg hover:bg-danger/10 text-gray-400 hover:text-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
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
              className="glass rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Título do Módulo *</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="input-field"
                    placeholder="Ex: Introdução ao Curso"
                    required
                  />
                </div>

                {editingModule && (
                  <div>
                    <label className="label">Ordem</label>
                    <input
                      type="number"
                      value={formData.ordem}
                      onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                      className="input-field"
                      min="0"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    {editingModule ? 'Salvar' : 'Criar Módulo'}
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
    </div>
  )
}
