'use client'

import { Bell, Search, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function AdminHeader({ title, subtitle }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center bg-surface-light border border-white/5 rounded-xl px-4 py-2.5 w-64">
          <Search className="w-4 h-4 text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="bg-transparent text-sm text-gray-200 placeholder:text-gray-500 outline-none w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-surface-light border border-white/5 text-gray-400 hover:text-white hover:bg-surface-hover transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
            3
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.nome || 'Administrador'}</p>
            <p className="text-xs text-gray-500">{user?.role === 'administrador' ? 'Admin' : 'Usuário'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  )
}
