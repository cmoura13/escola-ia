'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  Download,
  Search,
  CheckCircle,
  Calendar,
  FileText,
  QrCode,
  ExternalLink,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Certificate, Course } from '@/types'
import { formatDate } from '@/utils'

export default function CertificadosPage() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<(Certificate & { course: Course })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) loadCertificates()
  }, [user])

  async function loadCertificates() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*, course:courses(*)')
        .eq('user_id', user?.id)
        .order('data_emissao', { ascending: false })

      if (error) throw error
      setCertificates(data || [])
    } catch (error) {
      console.error('Erro ao carregar certificados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCertificates = certificates.filter((cert) =>
    cert.course?.titulo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function downloadCertificate(cert: Certificate & { course: Course }) {
    // Simulação - em produção gerar PDF real
    const content = `
CERTIFICADO DE CONCLUSÃO

Escola-IA

Certificamos que

${user?.nome}

concluiu com êxito o curso

${cert.course?.titulo}

Carga Horária: ${cert.course?.carga_horaria} horas

Código de Validação: ${cert.codigo_validacao}

Data de Emissão: ${formatDate(cert.data_emissao)}

Este certificado pode ser validado em:
https://escola-ia.com/validar/${cert.codigo_validacao}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `certificado-${cert.course?.titulo.toLowerCase().replace(/\s+/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Meus Certificados</h1>
        <p className="text-gray-400">Todos os certificados obtidos na plataforma</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar certificado..."
          className="input-field pl-10"
        />
      </div>

      {/* Certificates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse" />
          ))}
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="card py-16 text-center">
          <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Você ainda não possui certificados</p>
          <p className="text-sm text-gray-600">Complete um curso para obter seu primeiro certificado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCertificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card card-hover group relative overflow-hidden"
            >
              {/* Certificate Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiPjxwYXRoIGQ9Ik0wIDQwaDQwVjBIMHY0MHptMjAtMjBoMjB2MjBIMjBWMjB6TTAgMjBoMjB2MjBIMFYyMHoiLz48L2c+PC9nPjwvc3ZnPg==')]" />
              </div>

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500/20 to-warning/20 flex items-center justify-center">
                    <Award className="w-7 h-7 text-accent-400" />
                  </div>
                  <span className="badge badge-success flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Válido
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-2">{cert.course?.titulo}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Certificado de conclusão do curso com carga horária de {cert.course?.carga_horaria} horas.
                </p>

                {/* Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Emitido em {formatDate(cert.data_emissao)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <QrCode className="w-4 h-4" />
                    Código: <code className="text-primary-400">{cert.codigo_validacao}</code>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => downloadCertificate(cert)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Certificado
                  </button>
                  <button className="p-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
