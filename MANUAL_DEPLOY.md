# 🎓 Escola-IA — Manual Completo da Solução

**Plataforma de Treinamentos Online**

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Estrutura do Projeto](#2-estrutura-do-projeto)
3. [Tecnologias](#3-tecnologias)
4. [Arquitetura do Banco de Dados](#4-arquitetura-do-banco-de-dados)
5. [Fluxo de Autenticação](#5-fluxo-de-autenticação)
6. [Manual de Deploy — Passo a Passo](#6-manual-de-deploy--passo-a-passo)
7. [Manutenção e Atualizações](#7-manutenção-e-atualizações)
8. [Solução de Problemas](#8-solução-de-problemas)

---

## 1. Visão Geral

O **Escola-IA** é uma plataforma de cursos online com dois perfis de acesso:

| Perfil | Funcionalidades |
|---|---|
| **Administrador** | Dashboard, CRUD de cursos, módulos e aulas, editor HTML avançado, gestão de usuários, relatórios, questionários com correção automática |
| **Aluno** | Dashboard, matrícula em cursos, progresso, questionários, certificados automáticos com QR code |

### Principais funcionalidades

- Login seguro com perfis Admin/Aluno
- Gestão completa de cursos, módulos e aulas
- Editor HTML rico (Tiptap) com tabelas, imagens, links
- Liberação progressiva de conteúdo
- Questionários com correção automática
- Certificados automáticos ao concluir curso
- Dashboard com métricas
- Dark mode padrão
- 100% responsivo e em português

---

## 2. Estrutura do Projeto

```
escola-ia/
├── .env.local                          # Credenciais Supabase (NÃO versionar)
├── .env.example                        # Template de variáveis de ambiente
├── package.json                        # Dependências e scripts
├── next.config.js                      # Configuração do Next.js
├── tailwind.config.ts                  # Tema e cores (dark mode)
├── tsconfig.json                       # Configuração TypeScript
├── postcss.config.js                   # PostCSS + Autoprefixer
├── next-env.d.ts                       # Tipos do Next.js
│
├── supabase/
│   └── migrations/
│       ├── 001_schema_completo.sql     # Schema completo do banco
│       └── 002_fix_progress_rls.sql    # Ajuste nas políticas RLS
│
├── src/
│   ├── app/                            # App Router do Next.js 14
│   │   ├── layout.tsx                  # Layout raiz (dark mode, font Inter)
│   │   ├── globals.css                 # Estilos globais Tailwind
│   │   ├── page.tsx                    # Landing page pública
│   │   │
│   │   ├── (auth)/                     # Rotas de autenticação
│   │   │   ├── login/page.tsx
│   │   │   └── recuperar-senha/page.tsx
│   │   │
│   │   ├── admin/                      # Painel administrativo
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── cursos/page.tsx
│   │   │   ├── cursos/[id]/modulos/page.tsx
│   │   │   ├── cursos/[id]/modulos/[moduloId]/aulas/page.tsx
│   │   │   ├── usuarios/page.tsx
│   │   │   └── relatorios/page.tsx
│   │   │
│   │   ├── aluno/                      # Painal do aluno
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── cursos/page.tsx
│   │   │   ├── cursos/[id]/page.tsx
│   │   │   ├── cursos/[id]/aulas/[aulaId]/page.tsx
│   │   │   └── certificados/page.tsx
│   │   │
│   │   └── api/
│   │       └── imagens/                # API para servir imagens locais
│   │           ├── route.ts
│   │           └── [file]/route.ts
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── aluno/
│   │   │   └── Sidebar.tsx
│   │   └── editor/
│   │       └── TiptapEditor.tsx
│   │
│   ├── hooks/
│   │   └── useAuth.ts                  # Zustand store para autenticação
│   │
│   ├── lib/
│   │   ├── supabase.ts                 # Cliente Supabase
│   │   ├── config.ts                   # Configuração centralizada
│   │   ├── database.types.ts           # Tipos TypeScript do banco
│   │   └── init.ts                     # Verificação de ambiente
│   │
│   ├── types/
│   │   └── index.ts                    # Interfaces do sistema
│   │
│   └── utils/
│       └── index.ts                    # Utilitários (cn, formatDate, CPF...)
│
└── imagens/                            # Imagens estáticas locais
    ├── capaolitip1.jpg
    ├── iap-220.jpg
    ├── imagem335.jpg
    ├── imagem344.jpg
    ├── imagem399.jpg
    ├── img799.png
    ├── linkia88.jpg
    └── polis405px1.jpg
```

### Fluxo de navegação entre telas

```
Landing (/) → Login (/login)
                ├── Admin → /admin/dashboard
                │            ├── /admin/cursos
                │            │   └── /admin/cursos/:id/modulos
                │            │       └── /admin/cursos/:id/modulos/:mid/aulas
                │            ├── /admin/usuarios
                │            └── /admin/relatorios
                │
                └── Aluno → /aluno/dashboard
                             ├── /aluno/cursos
                             │   └── /aluno/cursos/:id/aulas/:aulaId
                             └── /aluno/certificados
```

---

## 3. Tecnologias

### 3.1 Stack principal

| Categoria | Tecnologia | Versão | Finalidade |
|---|---|---|---|
| **Framework** | Next.js | 14.2.3 | SSR, SSG, App Router, API Routes |
| **Linguagem** | TypeScript | 5.4.5 | Tipagem estática |
| **UI** | React | 18.3.1 | Componentes |
| **Estilização** | Tailwind CSS | 3.4.3 | Utilitário, dark mode |
| **Animações** | Framer Motion | 11.2.4 | Animações declarativas |
| **Ícones** | Lucide React | 0.378.0 | Conjunto de ícones |

### 3.2 Editor de conteúdo

| Tecnologia | Função |
|---|---|
| **Tiptap 2.4** | Editor HTML WYSIWYG |
| @tiptap/starter-kit | Core do editor |
| @tiptap/extension-image | Inserção de imagens |
| @tiptap/extension-link | Links |
| @tiptap/extension-table | Tabelas |
| @tiptap/extension-underline | Sublinhado |
| @tiptap/extension-text-align | Alinhamento |
| @tiptap/extension-placeholder | Placeholder |

### 3.3 Gerenciamento de estado e formulários

| Tecnologia | Função |
|---|---|
| **Zustand 4.5** | Gerenciamento de estado global (auth) |
| **React Hook Form 7.51** | Formulários performáticos |
| **Zod 3.23** | Validação de schemas |

### 3.4 Utilitários

| Tecnologia | Função |
|---|---|
| clsx + tailwind-merge | Merge condicional de classes |
| date-fns | Formatação de datas |
| jsPDF + html2canvas | Geração de certificados em PDF |
| qrcode | QR code nos certificados |

### 3.5 Backend e banco

| Tecnologia | Função |
|---|---|
| **Supabase** | PostgreSQL + API REST |
| @supabase/supabase-js | Cliente JavaScript |

---

## 4. Arquitetura do Banco de Dados

### 4.1 Diagrama de entidades

```
users
├── id UUID (PK)
├── nome VARCHAR(255)
├── email VARCHAR(255) UNIQUE
├── senha_hash TEXT
├── telefone VARCHAR(20)
├── cpf VARCHAR(14)
├── role VARCHAR(20) ['administrador', 'professor', 'aluno']
├── status VARCHAR(20) ['ativo', 'bloqueado', 'inativo']
├── data_validade DATE
├── ultimo_acesso TIMESTAMPTZ
├── created_at TIMESTAMPTZ
└── updated_at TIMESTAMPTZ

courses
├── id UUID (PK)
├── titulo VARCHAR(255)
├── descricao TEXT
├── capa_url TEXT
├── professor_id UUID → users.id
├── carga_horaria INTEGER
├── nivel VARCHAR(20) ['basico', 'intermediario', 'avancado']
├── categoria VARCHAR(100)
├── status VARCHAR(20) ['ativo', 'inativo', 'rascunho']
├── created_at TIMESTAMPTZ
└── updated_at TIMESTAMPTZ

enrollments
├── id UUID (PK)
├── user_id UUID → users.id
├── course_id UUID → courses.id
├── data_matricula TIMESTAMPTZ
├── data_conclusao TIMESTAMPTZ
├── status VARCHAR(20) ['em_andamento', 'concluido', 'cancelado']
├── progresso_percentual INTEGER (0-100)
└── UNIQUE(user_id, course_id)

modules
├── id UUID (PK)
├── course_id UUID → courses.id
├── titulo VARCHAR(255)
├── ordem INTEGER
└── created_at TIMESTAMPTZ

lessons
├── id UUID (PK)
├── module_id UUID → modules.id
├── titulo VARCHAR(255)
├── conteudo_html TEXT
├── ordem INTEGER
├── duracao_minutos INTEGER
├── created_at TIMESTAMPTZ
└── updated_at TIMESTAMPTZ

quizzes
├── id UUID (PK)
├── lesson_id UUID → lessons.id
├── pergunta TEXT
├── ordem INTEGER
└── created_at TIMESTAMPTZ

answers
├── id UUID (PK)
├── quiz_id UUID → quizzes.id
├── alternativa TEXT
├── correta BOOLEAN
└── ordem INTEGER

progress
├── id UUID (PK)
├── user_id UUID → users.id
├── lesson_id UUID → lessons.id
├── concluida BOOLEAN
├── data_conclusao TIMESTAMPTZ
├── nota_quiz DECIMAL(5,2)
├── tentativas INTEGER
├── tempo_assistido_segundos INTEGER
├── created_at TIMESTAMPTZ
├── updated_at TIMESTAMPTZ
└── UNIQUE(user_id, lesson_id)

certificates
├── id UUID (PK)
├── user_id UUID → users.id
├── course_id UUID → courses.id
├── codigo_validacao VARCHAR(50) UNIQUE
├── data_emissao TIMESTAMPTZ
├── created_at TIMESTAMPTZ
└── UNIQUE(user_id, course_id)

notifications
├── id UUID (PK)
├── user_id UUID → users.id
├── titulo VARCHAR(255)
├── mensagem TEXT
├── tipo VARCHAR(50)
├── lida BOOLEAN
└── created_at TIMESTAMPTZ
```

### 4.2 Relacionamentos

```
users 1──N enrollments N──1 courses
users 1──N progress N──1 lessons
users 1──N certificates N──1 courses
users 1──N notifications

courses 1──N modules 1──N lessons
lessons 1──N quizzes 1──N answers
```

### 4.3 Índices criados

```sql
users(email), users(role)
enrollments(user_id), enrollments(course_id)
modules(course_id)
lessons(module_id)
quizzes(lesson_id)
answers(quiz_id)
progress(user_id), progress(lesson_id)
certificates(user_id), certificates(codigo_validacao)
notifications(user_id)
```

### 4.4 Triggers e funções

- **update_updated_at_column()** → Atualiza `updated_at` automaticamente em users, courses, lessons, progress
- **generate_certificate_code()** → Gera código único `ESC-XXXXXXXX` para certificados
- **calcular_progresso_curso()** → Calcula percentual de conclusão do curso
- **verificar_conclusao_curso()** → Ao concluir 100%, gera certificado automaticamente

---

## 5. Fluxo de Autenticação

> ⚠️ **Arquitetura atual:** A aplicação usa autenticação **personalizada** com consulta direta à tabela `users`, senha verificada via `crypt()` do PostgreSQL, e estado mantido via Zustand com persistência em `localStorage`. **Não** utiliza `supabase.auth`.

### 5.1 Fluxo de login

```
1. Usuário preenche email + senha
2. Frontend consulta tabela users via Supabase REST
3. Verifica senha (compara com crypt() ou usuarios de teste)
4. Se OK: atualiza ultimo_acesso, salva user no Zustand
5. Redireciona: admin → /admin/dashboard | aluno → /aluno/dashboard
6. Se erro: exibe mensagem na tela
```

### 5.2 Controles de acesso

- **Admin layout:** Verifica `user.role === 'administrador'` — redireciona para /login se falhar
- **Aluno layout:** Verifica se `user` existe — redireciona para /login se falhar
- **Zustand persist:** Mantém sessão mesmo após refresh (localStorage)

### 5.3 Credenciais padrão

| Perfil | Email | Senha |
|---|---|---|
| Administrador | admin@escola-ia.com | admin123 |
| Aluno Teste | aluno@escola-ia.com | aluno123 |

---

## 6. Manual de Deploy — Passo a Passo

### Pré-requisitos

- Domínio próprio (ex: `escola-ia.com.br`)
- Conta no [Supabase](https://supabase.com) — já configurada
- Conta no [GitHub](https://github.com) para versionamento
- Conta na [Vercel](https://vercel.com) para deploy
- Git instalado

---

### Passo 1 — Verificar/recriar o banco no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login e selecione o projeto `escola-ia` (ou crie um novo)
3. Vá em **Project Settings → API** e anote os valores:
   - `Project URL`
   - `anon public`
   - `service_role`
4. Vá no **SQL Editor**, execute os arquivos na ordem:
   - `supabase/migrations/001_schema_completo.sql`
   - `supabase/migrations/002_fix_progress_rls.sql`

> Os scripts criam todas as tabelas, índices, RLS, triggers e os usuários padrão.

### Passo 2 — Criar repositório Git e enviar para GitHub

```bash
# Na raiz do projeto
cd C:\Projetos\escola-ia
git init
git add .
git commit -m "feat: initial commit - Escola-IA platform"
```

Crie um repositório no GitHub (vazio, sem README/LICENSE) e faça push:

```bash
git remote add origin https://github.com/seu-usuario/escola-ia.git
git branch -M main
git push -u origin main
```

### Passo 3 — Configurar variáveis de ambiente

O arquivo `.env.local` **não** deve ir para o repositório (adicione ao `.gitignore` se necessário). As variáveis serão configuradas diretamente na Vercel.

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
NEXT_PUBLIC_APP_NAME=Escola-IA
NEXT_PUBLIC_APP_URL=https://seudominio.com.br
```

### Passo 4 — Fazer deploy na Vercel

#### Opção A — Via GitHub (recomendado)

1. Acesse [https://vercel.com](https://vercel.com)
2. Clique em **Add New → Project**
3. Importe o repositório `escola-ia`
4. Em **Environment Variables**, adicione:

| Nome | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://seu-projeto.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sua chave anon |
| `SUPABASE_SERVICE_ROLE_KEY` | sua chave service_role |
| `NEXT_PUBLIC_APP_NAME` | `Escola-IA` |
| `NEXT_PUBLIC_APP_URL` | `https://seudominio.com.br` |

5. **Framework Preset:** Next.js (detectado automaticamente)
6. **Build Command:** `npm run build`
7. **Output Directory:** `.next` (padrão)
8. Clique em **Deploy**

#### Opção B — Via CLI (terminal)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Responda às perguntas interativas e informe as variáveis de ambiente quando solicitado.

### Passo 5 — Configurar domínio personalizado

#### Na Vercel:

1. Abra o projeto → **Settings → Domains**
2. Digite `seudominio.com.br` e clique em **Add**
3. A Vercel mostrará as instruções de DNS

#### No seu provedor de domínio (ex: Registro.br, Cloudflare, HostGator):

Adicione os seguintes registros DNS:

| Tipo | Nome/Host | Valor | TTL |
|---|---|---|---|
| CNAME | `www` | `cname.vercel-dns.com` | Automático |
| CNAME | `@` (apex) | `your-project.vercel.app` | Automático |

Ou use os nameservers da Vercel (avançado):

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

A propagação pode levar de alguns minutos a 48 horas.

### Passo 6 — Ajustar `next.config.js` para produção

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'seudominio.com.br' }
    ]
  }
}
module.exports = nextConfig
```

### Passo 7 — Migrar imagens para o Supabase Storage (recomendado)

As imagens na pasta `imagens/` **não persistem** em ambiente serverless. Para producão, migre para o Storage do Supabase:

1. No Supabase Dashboard → **Storage** → **New Bucket**
2. Nome: `course-covers`, público: **ON**
3. Faça upload manual ou use script de migração
4. Atualize as URLs das capas nos cursos no banco

Script de migração (crie `scripts/upload-images.js`):

```js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function uploadImages() {
  const dir = path.join(__dirname, '..', 'imagens')
  const files = fs.readdirSync(dir).filter(f =>
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f)
  )

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file))
    const { error } = await supabase.storage
      .from('course-covers')
      .upload(`public/${file}`, content, {
        contentType: `image/${path.extname(file).slice(1)}`,
        upsert: true,
      })
    if (error) console.error('Erro:', file, error)
    else console.log('Upload OK:', file)
  }
}
uploadImages()
```

### Passo 8 — Verificar o deploy

1. Acesse `https://seudominio.com.br`
2. A landing page deve carregar
3. Clique em **Acessar Plataforma**
4. Faça login com:
   - `admin@escola-ia.com` / `admin123` → Painel Admin
   - `aluno@escola-ia.com` / `aluno123` → Painel Aluno
5. Teste criação de curso, aulas, questionários
6. Teste matrícula e progresso do aluno

### Passo 9 (Opcional) — SSL/HTTPS

A Vercel já fornece certificado SSL automático (Let's Encrypt). Certifique-se de que o DNS está apontando corretamente para que o HTTPS funcione em até 24h.

---

## 7. Manutenção e Atualizações

### Fluxo de atualizacão

```bash
# 1. Fazer alterações no código
git add .
git commit -m "tipo: descrição da mudança"

# 2. Enviar para GitHub
git push origin main
```

A Vercel detecta o push automaticamente e faz o rebuild/deploy (geralmente leva de 1 a 3 minutos).

### Boas práticas de commit

```
feat: descrição de nova funcionalidade
fix: descrição de correção de bug
refactor: descrição de refatoração
docs: descrição de mudança em documentação
chore: descrição de tarefa de manutenção
```

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Iniciar servidor de desenvolvimento (localhost:3000) |
| `npm run build` | Build de produção |
| `npm start` | Iniciar servidor em produção |
| `npm run lint` | Verificar código com ESLint |

---

## 8. Solução de Problemas

### Erro: "Supabase não configurado"

**Causa:** Variáveis de ambiente ausentes ou inválidas.

**Solução:**
- Verifique se todas as env vars estão configuradas na Vercel
- Confirme que as chaves no Supabase Dashboard estão corretas
- Reexecute as migrations no SQL Editor do Supabase

### Erro: "Email ou senha incorretos" mesmo com credenciais corretas

**Causa:** Tabela `users` vazia ou senha não corresponde.

**Solução:**
- Execute novamente a migration `001_schema_completo.sql` para recriar os usuários padrão
- Verifique se a coluna `senha_hash` existe e contém o hash bcrypt

### Erro: 406/401 ao acessar tabela progress

**Causa:** Políticas RLS bloqueando acesso (auth.uid() retorna nulo).

**Solução:**
- Execute a migration `002_fix_progress_rls.sql` que substitui as políticas por versões permissivas

### Imagens não carregam em produção

**Causa:** A pasta `imagens/` não persiste em ambiente serverless.

**Solução:**
- Migre as imagens para o Supabase Storage ou Cloudinary
- Atualize as URLs no banco de dados

### Build falha na Vercel

**Causa:** Geralmente erro de tipo TypeScript ou dependência ausente.

**Solução:**
- Execute `npm run build` localmente para identificar o erro
- Verifique logs no Vercel Dashboard → Deployments → clicar no deploy com falha

---

> **Documentação gerada em:** 17/05/2026
>
> **Repositório:** https://github.com/seu-usuario/escola-ia
>
> **Suporte:** Em caso de dúvidas, entre em contato com o desenvolvedor.
