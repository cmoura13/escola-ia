export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          nome: string
          email: string
          senha_hash: string
          telefone: string | null
          cpf: string | null
          role: string
          status: string
          data_validade: string | null
          ultimo_acesso: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          senha_hash: string
          telefone?: string | null
          cpf?: string | null
          role?: string
          status?: string
          data_validade?: string | null
          ultimo_acesso?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          senha_hash?: string
          telefone?: string | null
          cpf?: string | null
          role?: string
          status?: string
          data_validade?: string | null
          ultimo_acesso?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          titulo: string
          descricao: string | null
          capa_url: string | null
          professor_id: string | null
          carga_horaria: number
          nivel: string | null
          categoria: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          descricao?: string | null
          capa_url?: string | null
          professor_id?: string | null
          carga_horaria?: number
          nivel?: string | null
          categoria?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          descricao?: string | null
          capa_url?: string | null
          professor_id?: string | null
          carga_horaria?: number
          nivel?: string | null
          categoria?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string
          titulo: string
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          titulo: string
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          titulo?: string
          ordem?: number
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          titulo: string
          conteudo_html: string | null
          ordem: number
          duracao_minutos: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          titulo: string
          conteudo_html?: string | null
          ordem?: number
          duracao_minutos?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          titulo?: string
          conteudo_html?: string | null
          ordem?: number
          duracao_minutos?: number
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          lesson_id: string
          pergunta: string
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          pergunta: string
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          pergunta?: string
          ordem?: number
          created_at?: string
        }
      }
      answers: {
        Row: {
          id: string
          quiz_id: string
          alternativa: string
          correta: boolean
          ordem: number
        }
        Insert: {
          id?: string
          quiz_id: string
          alternativa: string
          correta?: boolean
          ordem?: number
        }
        Update: {
          id?: string
          quiz_id?: string
          alternativa?: string
          correta?: boolean
          ordem?: number
        }
      }
      progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          concluida: boolean
          data_conclusao: string | null
          nota_quiz: number | null
          tentativas: number
          tempo_assistido_segundos: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          concluida?: boolean
          data_conclusao?: string | null
          nota_quiz?: number | null
          tentativas?: number
          tempo_assistido_segundos?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          concluida?: boolean
          data_conclusao?: string | null
          nota_quiz?: number | null
          tentativas?: number
          tempo_assistido_segundos?: number
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          data_matricula: string
          data_conclusao: string | null
          status: string
          progresso_percentual: number
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          data_matricula?: string
          data_conclusao?: string | null
          status?: string
          progresso_percentual?: number
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          data_matricula?: string
          data_conclusao?: string | null
          status?: string
          progresso_percentual?: number
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          codigo_validacao: string
          data_emissao: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          codigo_validacao?: string
          data_emissao?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          codigo_validacao?: string
          data_emissao?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          titulo: string
          mensagem: string | null
          tipo: string
          lida: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titulo: string
          mensagem?: string | null
          tipo?: string
          lida?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          titulo?: string
          mensagem?: string | null
          tipo?: string
          lida?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_progresso_curso: {
        Args: { p_user_id: string; p_course_id: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
