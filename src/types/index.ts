export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  role: 'administrador' | 'professor' | 'aluno';
  status: 'ativo' | 'bloqueado' | 'inativo';
  data_validade?: string;
  ultimo_acesso?: string;
  created_at: string;
}

export interface Course {
  id: string;
  titulo: string;
  descricao?: string;
  capa_url?: string;
  professor_id?: string;
  carga_horaria: number;
  nivel?: 'basico' | 'intermediario' | 'avancado';
  categoria?: string;
  status: 'ativo' | 'inativo' | 'rascunho';
  created_at: string;
  professor?: User;
}

export interface Module {
  id: string;
  course_id: string;
  titulo: string;
  ordem: number;
  created_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  titulo: string;
  conteudo_html?: string;
  ordem: number;
  duracao_minutos: number;
  created_at: string;
  quizzes?: Quiz[];
}

export interface Quiz {
  id: string;
  lesson_id: string;
  pergunta: string;
  ordem: number;
  created_at: string;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  quiz_id: string;
  alternativa: string;
  correta: boolean;
  ordem: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  data_matricula: string;
  data_conclusao?: string;
  status: 'em_andamento' | 'concluido' | 'cancelado';
  progresso_percentual: number;
  course?: Course;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  concluida: boolean;
  data_conclusao?: string;
  nota_quiz?: number;
  tentativas: number;
  tempo_assistido_segundos: number;
  created_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  codigo_validacao: string;
  data_emissao: string;
  course?: Course;
}

export interface Notification {
  id: string;
  user_id: string;
  titulo: string;
  mensagem?: string;
  tipo: string;
  lida: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalAlunos: number;
  totalCursos: number;
  totalMatriculas: number;
  taxaConclusao: number;
}

export interface CourseWithProgress extends Course {
  enrollment?: Enrollment;
  modules?: Module[];
  totalLessons?: number;
  completedLessons?: number;
}
