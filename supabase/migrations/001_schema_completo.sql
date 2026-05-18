-- =====================================================
-- ESCOLA-IA - SUPABASE MIGRATION
-- Plataforma de Treinamentos Online
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- 1. USUÁRIOS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(14),
    role VARCHAR(20) NOT NULL DEFAULT 'aluno' CHECK (role IN ('administrador', 'professor', 'aluno')),
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'bloqueado', 'inativo')),
    data_validade DATE,
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CURSOS
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    capa_url TEXT,
    professor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    carga_horaria INTEGER DEFAULT 0,
    nivel VARCHAR(20) CHECK (nivel IN ('basico', 'intermediario', 'avancado')),
    categoria VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'rascunho')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MATRÍCULAS (relaciona aluno com curso)
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    data_matricula TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_conclusao TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'cancelado')),
    progresso_percentual INTEGER DEFAULT 0 CHECK (progresso_percentual BETWEEN 0 AND 100),
    UNIQUE(user_id, course_id)
);

-- 4. MÓDULOS
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    ordem INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AULAS
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    conteudo_html TEXT,
    ordem INTEGER NOT NULL DEFAULT 0,
    duracao_minutos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. QUESTIONÁRIOS
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. RESPOSTAS (alternativas)
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    alternativa TEXT NOT NULL,
    correta BOOLEAN NOT NULL DEFAULT FALSE,
    ordem INTEGER DEFAULT 0
);

-- 8. PROGRESSO DO ALUNO
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    concluida BOOLEAN NOT NULL DEFAULT FALSE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    nota_quiz DECIMAL(5,2),
    tentativas INTEGER DEFAULT 0,
    tempo_assistido_segundos INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- 9. CERTIFICADOS
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    codigo_validacao VARCHAR(50) UNIQUE NOT NULL,
    data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 10. NOTIFICAÇÕES
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT,
    tipo VARCHAR(50) DEFAULT 'info',
    lida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);
CREATE INDEX idx_answers_quiz ON answers(quiz_id);
CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_progress_lesson ON progress(lesson_id);
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_code ON certificates(codigo_validacao);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para USERS
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));
CREATE POLICY "users_insert_admin" ON users FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));
CREATE POLICY "users_update_admin" ON users FOR UPDATE USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));
CREATE POLICY "users_delete_admin" ON users FOR DELETE USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));

-- Políticas para COURSES
CREATE POLICY "courses_select_all" ON courses FOR SELECT USING (true);
CREATE POLICY "courses_admin_all" ON courses FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));

-- Políticas para ENROLLMENTS
CREATE POLICY "enrollments_select_own" ON enrollments FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));
CREATE POLICY "enrollments_insert_own" ON enrollments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "enrollments_update_own" ON enrollments FOR UPDATE USING (user_id = auth.uid());

-- Políticas para MODULES
CREATE POLICY "modules_select_all" ON modules FOR SELECT USING (true);
CREATE POLICY "modules_admin_all" ON modules FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));

-- Políticas para LESSONS
CREATE POLICY "lessons_select_enrolled" ON lessons FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM enrollments e 
        JOIN modules m ON m.course_id = e.course_id 
        WHERE e.user_id = auth.uid() AND m.id = lessons.module_id
    ) OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador')
);
CREATE POLICY "lessons_admin_all" ON lessons FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));

-- Políticas para QUIZZES
CREATE POLICY "quizzes_select_enrolled" ON quizzes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM enrollments e 
        JOIN modules m ON m.course_id = e.course_id 
        JOIN lessons l ON l.module_id = m.id 
        WHERE e.user_id = auth.uid() AND l.id = quizzes.lesson_id
    ) OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador')
);
CREATE POLICY "quizzes_admin_all" ON quizzes FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));

-- Políticas para ANSWERS
CREATE POLICY "answers_select_enrolled" ON answers FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM enrollments e 
        JOIN modules m ON m.course_id = e.course_id 
        JOIN lessons l ON l.module_id = m.id 
        JOIN quizzes q ON q.lesson_id = l.id 
        WHERE e.user_id = auth.uid() AND q.id = answers.quiz_id
    ) OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador')
);
CREATE POLICY "answers_admin_all" ON answers FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));

-- Políticas para PROGRESS
CREATE POLICY "progress_select_own" ON progress FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));
CREATE POLICY "progress_insert_own" ON progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "progress_update_own" ON progress FOR UPDATE USING (user_id = auth.uid());

-- Políticas para CERTIFICATES
CREATE POLICY "certificates_select_own" ON certificates FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));

-- Políticas para NOTIFICATIONS
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_insert_admin" ON notifications FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'administrador'));

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar código de validação do certificado
CREATE OR REPLACE FUNCTION generate_certificate_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.codigo_validacao = 'ESC-' || UPPER(SUBSTRING(MD5(NEW.id::text || NEW.user_id::text || NEW.course_id::text), 1, 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_certificate_code BEFORE INSERT ON certificates FOR EACH ROW EXECUTE FUNCTION generate_certificate_code();

-- Função para calcular progresso do curso
CREATE OR REPLACE FUNCTION calcular_progresso_curso(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_aulas INTEGER;
    aulas_concluidas INTEGER;
    percentual INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_aulas
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    WHERE m.course_id = p_course_id;

    SELECT COUNT(*) INTO aulas_concluidas
    FROM progress p
    JOIN lessons l ON l.id = p.lesson_id
    JOIN modules m ON m.id = l.module_id
    WHERE p.user_id = p_user_id AND m.course_id = p_course_id AND p.concluida = true;

    IF total_aulas = 0 THEN
        RETURN 0;
    END IF;

    percentual := (aulas_concluidas * 100) / total_aulas;
    RETURN percentual;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se curso foi concluído e gerar certificado
CREATE OR REPLACE FUNCTION verificar_conclusao_curso()
RETURNS TRIGGER
SECURITY DEFINER
AS $$
DECLARE
    v_course_id UUID;
    v_progresso INTEGER;
    v_certificado_existe INTEGER;
BEGIN
    -- Pegar o course_id da aula
    SELECT m.course_id INTO v_course_id
    FROM lessons l
    JOIN modules m ON m.id = l.module_id
    WHERE l.id = NEW.lesson_id;

    -- Calcular progresso
    v_progresso := calcular_progresso_curso(NEW.user_id, v_course_id);

    -- Atualizar enrollment
    UPDATE enrollments 
    SET progresso_percentual = v_progresso,
        status = CASE WHEN v_progresso = 100 THEN 'concluido' ELSE status END,
        data_conclusao = CASE WHEN v_progresso = 100 THEN NOW() ELSE data_conclusao END
    WHERE user_id = NEW.user_id AND course_id = v_course_id;

    -- Se concluiu 100%, gerar certificado se não existir
    IF v_progresso = 100 THEN
        SELECT COUNT(*) INTO v_certificado_existe
        FROM certificates
        WHERE user_id = NEW.user_id AND course_id = v_course_id;

        IF v_certificado_existe = 0 THEN
            INSERT INTO certificates (user_id, course_id)
            VALUES (NEW.user_id, v_course_id);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_verificar_conclusao AFTER INSERT OR UPDATE ON progress FOR EACH ROW EXECUTE FUNCTION verificar_conclusao_curso();

-- Função RPC para atualizar progresso do curso (chamada do frontend, bypassa RLS)
CREATE OR REPLACE FUNCTION atualizar_progresso_curso(p_user_id UUID, p_course_id UUID, p_percentual INTEGER)
RETURNS VOID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE enrollments 
    SET progresso_percentual = p_percentual,
        status = CASE WHEN p_percentual = 100 THEN 'concluido' ELSE status END,
        data_conclusao = CASE WHEN p_percentual = 100 THEN NOW() ELSE data_conclusao END
    WHERE user_id = p_user_id AND course_id = p_course_id;
END;
$$;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Criar usuário administrador padrão (senha: admin123)
INSERT INTO users (nome, email, senha_hash, role, status)
VALUES ('Administrador', 'admin@escola-ia.com', crypt('admin123', gen_salt('bf')), 'administrador', 'ativo');

-- Criar usuário aluno de teste (senha: aluno123)
INSERT INTO users (nome, email, senha_hash, role, status)
VALUES ('Aluno Teste', 'aluno@escola-ia.com', crypt('aluno123', gen_salt('bf')), 'aluno', 'ativo');
