# VIVA Platform 2.0

Plataforma inteligente para análise de conversas de vendas com Claude API + Supabase.

## 🚀 Quick Start

### 1. Clonar Repositório

```bash
git clone https://github.com/seu-usuario/viva-platform.git
cd viva-platform
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
CLAUDE_API_KEY=sk-ant-XXXXXXXXXXXX
```

### 3. Setup Supabase

#### Opção A: Usando Supabase Dashboard

1. Vá para [supabase.com](https://supabase.com)
2. Crie um novo projeto (ou use existente)
3. Vá para **SQL Editor**
4. Copie o conteúdo de `supabase/migrations/001_create_tables.sql`
5. Cole e execute
6. Copie as credenciais para `.env.local`

#### Opção B: Usando Supabase CLI (recomendado)

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref YOUR-PROJECT-ID

# Rodar migrations
supabase db push
```

### 4. Rodar Localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

### 5. Deploy no Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Ou conecte seu repo GitHub no [Vercel Dashboard](https://vercel.com/dashboard) para deploy automático.

---

## 📋 Funcionalidades MVP

- ✅ **Upload de .txt** — Recebe conversa em texto
- ✅ **Digitação Direta** — Cole a conversa na plataforma
- ✅ **Claude API Integration** — Análise automática com IA
- ✅ **Extração de Dados** — Contato, datas, nome do cliente
- ✅ **5 Pilares de Análise** — Score por dimensão
- ✅ **Dashboard** — Grid de conversas + Grid de clientes
- ✅ **Modals** — Detalhes completos das análises
- ✅ **Autenticação** — Via Supabase Auth (preparado)
- ✅ **Supabase Storage** — Armazena arquivos .txt

---

## 🔑 Usuários de Teste

Após criar Auth no Supabase, use:

- **Master:** `luiz@paletamarketing.com.br` (pode tudo)
- **Suporte:** `julia.paletamarketing@gmail.com` (pode analisar)
- **Cliente:** `lavdneto@gmail.com` (acesso limitado)

---

## 🏗️ Arquitetura

```
viva-platform/
├── src/
│   ├── pages/
│   │   ├── _app.tsx (App principal)
│   │   ├── index.tsx (Dashboard)
│   │   └── api/
│   │       └── analisar.ts (Rota API)
│   ├── components/
│   │   ├── UploadModal.tsx
│   │   ├── AnalisesGrid.tsx
│   │   ├── AnalisesModal.tsx
│   │   ├── ClientesGrid.tsx
│   │   └── ClientePerfilModal.tsx
│   ├── lib/
│   │   ├── types.ts (TypeScript types)
│   │   ├── supabase.ts (Cliente Supabase)
│   │   └── claude.ts (Integração Claude API)
│   └── styles/
│       └── globals.css
├── supabase/
│   └── migrations/
│       └── 001_create_tables.sql
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vercel.json
```

---

## 🔄 Fluxo de Análise

1. **Upload/Digitação** — Usuário envia .txt ou digita conversa
2. **API Route** — `/api/analisar` recebe a conversa
3. **Claude Processing** — Prompt VIVA 2.0 extrai e analisa
4. **Supabase Save** — Resultado salvo na tabela `analises`
5. **UI Update** — Dashboard recarrega com nova análise

---

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública Supabase | ✅ |
| `CLAUDE_API_KEY` | Chave Claude API | ✅ |
| `NEXT_PUBLIC_APP_NAME` | Nome da app | ❌ |
| `NEXT_PUBLIC_APP_VERSION` | Versão | ❌ |

---

## 📡 API Routes

### POST /api/analisar

Recebe uma conversa e retorna análise completa.

**Request:**
```json
{
  "conversa": "10/07/2026, 14:22 - Cliente: Olá... [texto completo]"
}
```

**Response (201):**
```json
{
  "sucesso": true,
  "analise_id": "evt_loppifest_20260710_5592982410613",
  "contato": "5592982410613",
  "cliente_nome": "João",
  "sentimento": {
    "score": 95,
    "geral": "muito_positivo"
  }
}
```

---

## 🚀 Próximas Fases

### Fase 2 (Design Polido)
- [ ] Componentes shadcn/ui
- [ ] Dark mode
- [ ] Responsive mobile
- [ ] Animações

### Fase 3 (Autenticação)
- [ ] Login com email/password
- [ ] Magic link
- [ ] Google OAuth
- [ ] Permissões por papel

### Fase 4 (Integrações)
- [ ] WhatsApp API
- [ ] Google Drive
- [ ] Slack
- [ ] Webhooks

---

## 📝 Prompt VIVA 2.0

O prompt atual extrai:

- **Contato** — Número de WhatsApp
- **Data Início** — Primeira mensagem
- **Data Última** — Última mensagem
- **Cliente Nome** — Inteligência: nome → evento → vazio

E analisa:

1. **Sentimento** (0-100)
2. **5 Pilares** (score + descrição)
3. **Problemas** (array)
4. **Oportunidades** (array)
5. **Ações** (array)

Ver: `src/lib/claude.ts`

---

## 🛡️ Segurança

- ✅ **CORS** — Configurado para Vercel
- ✅ **RLS** — Row-Level Security no Supabase
- ✅ **Rate Limiting** — Via Supabase (configurar)
- ⏳ **Auth** — Implementar com Supabase Auth
- ⏳ **Encryption** — CLAUDE_API_KEY protegida no server

---

## 🐛 Troubleshooting

### "CLAUDE_API_KEY não configurada"
- Verifique `.env.local`
- Certifique que começa com `sk-ant-`
- Restart dev server: `npm run dev`

### "Supabase connection failed"
- Verifique URL e chave em `.env.local`
- Confirme projeto Supabase está ativo
- Cheque aba "SQL" no Supabase Dashboard

### "Análise não aparece no dashboard"
- Verifique se tabela `analises` foi criada
- Cheque RLS policies
- Veja Network tab (F12) para erros da API

---

## 📞 Suporte

- **Issues:** GitHub Issues
- **Docs:** `/docs` (coming soon)
- **Discord:** [link] (coming soon)

---

## 📄 Licença

MIT

---

**Versão:** 2.0.0  
**Atualizado:** 15/07/2026
