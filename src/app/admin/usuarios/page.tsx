'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Lock,
  UserCheck,
  UserX,
  X,
  Mail,
  Phone,
  Shield,
  Check,
  Copy,
} from 'lucide-react'
import AdminHeader from '@/components/admin/Header'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'
import { generatePassword, formatDate } from '@/utils'
import { cn } from '@/utils'

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('todos')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [showPasswordCopied, setShowPasswordCopied] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    role: 'aluno' as const,
    status: 'ativo' as const,
    data_validade: '',
  })

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const password = generatePassword()
      setGeneratedPassword(password)

      if (editingUser) {
        const { error } = await supabase
          .from('users')
          .update({
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
            cpf: formData.cpf,
            role: formData.role,
            status: formData.status,
            data_validade: formData.data_validade || null,
          })
          .eq('id', editingUser.id)

        if (error) throw error
      } else {
        // Criar novo usuário - em produção usar Supabase Auth
        const { error } = await supabase.from('users').insert({
          nome: formData.nome,
          email: formData.email,
          senha_hash: password, // Em produção: hash real
          telefone: formData.telefone,
          cpf: formData.cpf,
          role: formData.role,
          status: formData.status,
          data_validade: formData.data_validade || null,
        })

        if (error) throw error
      }

      await loadUsers()
      if (!editingUser) {
        setShowPasswordCopied(true)
        setTimeout(() => setShowPasswordCopied(false), 5000)
      } else {
        setShowModal(false)
        setEditingUser(null)
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error)
      alert('Erro ao salvar usuário')
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId)
      if (error) throw error
      await loadUsers()
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
    }
  }

  async function handleToggleStatus(user: User) {
    try {
      const newStatus = user.status === 'ativo' ? 'bloqueado' : 'ativo'
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', user.id)

      if (error) throw error
      await loadUsers()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  async function handleResetPassword(user: User) {
    const newPassword = generatePassword()
    setGeneratedPassword(newPassword)
    setShowPasswordCopied(true)
    setTimeout(() => setShowPasswordCopied(false), 5000)
    // Em produção: enviar email com nova senha
  }

  function openModal(user?: User) {
    if (user) {
      setEditingUser(user)
      setFormData({
        nome: user.nome,
        email: user.email,
        telefone: user.telefone || '',
        cpf: user.cpf || '',
        role: user.role as any,
        status: user.status as any,
        data_validade: user.data_validade || '',
      })
    } else {
      setEditingUser(null)
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        role: 'aluno',
        status: 'ativo',
        data_validade: '',
      })
      setGeneratedPassword('')
    }
    setShowModal(true)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'todos' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const roleLabels = {
    administrador: { label: 'Administrador', color: 'bg-purple-500/20 text-purple-400' },
    professor: { label: 'Professor', color: 'bg-primary-500/20 text-primary-400' },
    aluno: { label: 'Aluno', color: 'bg-success/20 text-success' },
  }

  const statusLabels = {
    ativo: { label: 'Ativo', color: 'badge-success' },
    bloqueado: { label: 'Bloqueado', color: 'badge-danger' },
    inativo: { label: 'Inativo', color: 'badge-warning' },
  }

  return (
    <div className="animate-fade-in">
      <AdminHeader title="Usuários" subtitle="Gerencie todos os usuários da plataforma" />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar usuário..."
              className="input-field pl-10 text-sm"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input-field text-sm py-2.5"
          >
            <option value="todos">Todos</option>
            <option value="administrador">Admin</option>
            <option value="professor">Professor</option>
            <option value="aluno">Aluno</option>
          </select>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Usuário</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Contato</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Perfil</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Último Acesso</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-12 bg-surface-light rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-400">
                            {user.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.nome}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {user.telefone && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.telefone}
                          </p>
                        )}
                        {user.cpf && <p className="text-xs text-gray-500">{user.cpf}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn('badge', roleLabels[user.role as keyof typeof roleLabels]?.color)}>
                        {roleLabels[user.role as keyof typeof roleLabels]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn('badge', statusLabels[user.status as keyof typeof statusLabels]?.color)}>
                        {statusLabels[user.status as keyof typeof statusLabels]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-400">
                        {user.ultimo_acesso ? formatDate(user.ultimo_acesso) : 'Nunca'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                          title={user.status === 'ativo' ? 'Bloquear' : 'Ativar'}
                        >
                          {user.status === 'ativo' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                          title="Resetar senha"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(user)}
                          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-lg hover:bg-danger/10 text-gray-400 hover:text-danger transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {generatedPassword && showPasswordCopied && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-xl bg-success/10 border border-success/20"
                >
                  <p className="text-sm text-success font-medium mb-2">Senha gerada com sucesso!</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/30 px-3 py-2 rounded-lg text-sm text-white font-mono">
                      {generatedPassword}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPassword)
                        setShowPasswordCopied(false)
                      }}
                      className="p-2 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Copie esta senha e envie ao usuário.</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Telefone</label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="input-field"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <label className="label">CPF</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="input-field"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Perfil *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="input-field"
                      required
                    >
                      <option value="aluno">Aluno</option>
                      <option value="professor">Professor</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input-field"
                      required
                    >
                      <option value="ativo">Ativo</option>
                      <option value="bloqueado">Bloqueado</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Data de Validade</label>
                  <input
                    type="date"
                    value={formData.data_validade}
                    onChange={(e) => setFormData({ ...formData, data_validade: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
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
