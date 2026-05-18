# 🎓 Escola-IA - Plataforma de Treinamentos Online

## ⚠️ CONFIGURAÇÃO OBRIGATÓRIA ANTES DE RODAR

### Passo 1: Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com) chamado `escola-ia`
2. Execute o SQL em `supabase/migrations/001_schema_completo.sql` no SQL Editor

### Passo 2: Configure as variáveis de ambiente

1. No Supabase Dashboard, vá em **Project Settings > API**
2. Copie estes 3 valores:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

3. Crie o arquivo `.env.local` na **RAIZ DO PROJETO** (mesma pasta do package.json):

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui
```

> ⚠️ **IMPORTANTE:**
> - Não use aspas nos valores
> - O arquivo deve se chamar EXATAMENTE `.env.local` (com ponto no início)
> - Deve ficar na mesma pasta que `package.json`

### Passo 3: Instale e rode

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

---

## 👤 Acessos Padrão

| Perfil | Email | Senha |
|--------|-------|-------|
| Administrador | admin@escola-ia.com | admin123 |
| Aluno Teste | aluno@escola-ia.com | aluno123 |

---

## 🗂️ Estrutura do Projeto

```
escola-ia/
├── .env.local              ← CRIAR ESTE ARQUIVO!
├── .env.local.example      ← Template de exemplo
├── package.json
├── next.config.js
├── tailwind.config.ts
├── src/
│   ├── app/                ← Rotas Next.js 14 (App Router)
│   ├── components/         ← Componentes React
│   ├── lib/
│   │   └── supabase.ts     ← Cliente Supabase
│   ├── hooks/              ← Zustand store
│   ├── types/              ← Tipos TypeScript
│   └── utils/              ← Funções utilitárias
├── supabase/
│   └── migrations/
│       └── 001_schema_completo.sql
└── README.md
```

## 🎨 Tecnologias

- **Next.js 14** + React 18 + TypeScript
- **Tailwind CSS** + Framer Motion
- **Supabase** (PostgreSQL + Auth)
- **Tiptap** (Editor HTML)
- **Zustand** (State management)

## ✨ Funcionalidades

- ✅ Login seguro com roles (Admin/Aluno)
- ✅ Gestão completa de usuários, cursos, módulos e aulas
- ✅ Editor HTML avançado (Tiptap)
- ✅ Questionários com correção automática
- ✅ Liberação progressiva de conteúdo
- ✅ Certificados automáticos
- ✅ Dashboard com métricas
- ✅ Dark mode (padrão)
- ✅ 100% Responsivo
- ✅ 100% em Português
