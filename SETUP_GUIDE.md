# 🚀 SETUP COMPLETO — VIVA Platform 2.0

Guia passo a passo para colocar a VIVA rodando em produção.

---

## FASE 1: GitHub + Setup Local

### 1.1 — Criar Repositório no GitHub

1. Vá para https://github.com/new
2. Nome: `viva-platform`
3. Descrição: `Platform para análise de conversas com Claude API`
4. Visibilidade: **Private** (recomendado)
5. Clique **Create repository**

### 1.2 — Clonar e Configurar Local

```bash
# Clone o repo
git clone https://github.com/SEU-USUARIO/viva-platform.git
cd viva-platform

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.local.example .env.local

# Abra .env.local no editor
# Deixe em branco por enquanto (vai preencher depois)
```

### 1.3 — Teste Local

```bash
npm run dev
```

Abra http://localhost:3000 — deve ver a home com "Nenhuma análise realizada"

✅ **Fase 1 concluída**

---

## FASE 2: Supabase Setup

### 2.1 — Criar Projeto Supabase

1. Vá para https://supabase.com/dashboard
2. Clique **New Project**
3. Nome: `viva-platform`
4. Database password: **Salve em local seguro**
5. Region: **São Paulo** (sa-east-1)
6. Clique **Create new project** — vai demorar ~2 min

### 2.2 — Copiar Credenciais

Quando projeto estiver pronto:

1. Vá para **Settings** > **API**
2. Copie:
   - `Project URL` → cole em `.env.local` como `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → cole como `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Seu `.env.local` agora tem:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
CLAUDE_API_KEY=sk-ant-... (DEIXE EM BRANCO POR ENQUANTO)
```

### 2.3 — Criar as Tabelas

1. No Supabase Dashboard, vá para **SQL Editor**
2. Clique **+ New Query**
3. Cole o conteúdo de `supabase/migrations/001_create_tables.sql` **INTEIRO**
4. Clique **▶ Run**
5. Se vir ✅ abaixo, sucesso!

⚠️ Se tiver erro, verifique se o SQL está completo (sem truncar no meio).

### 2.4 — Criar Storage Bucket

1. Vá para **Storage** (sidebar esquerda)
2. Clique **+ New Bucket**
3. Nome: `conversas`
4. Public (deixe **Private** por segurança)
5. Clique **Create bucket**

✅ **Fase 2 concluída**

---

## FASE 3: Claude API

### 3.1 — Gerar Nova API Key

⚠️ **IMPORTANTE:** Você compartilhou a chave anterior comigo. Essa chave agora está **COMPROMETIDA**.

**Você PRECISA desativar a chave antiga e criar uma nova:**

1. Vá para https://console.anthropic.com/account/keys
2. Clique no olho ao lado da chave antiga para **deletar/revogar**
3. Clique **+ Create key**
4. Dê um nome: `viva-platform-prod`
5. Copie a nova chave (começará com `sk-ant-`)

### 3.2 — Adicionar ao .env.local

Cole em `.env.local`:

```
CLAUDE_API_KEY=sk-ant-XXXXXXXXXXXX
```

Seu `.env.local` agora está **completo**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
CLAUDE_API_KEY=sk-ant-XXXXXXXXXXXX
```

### 3.3 — Teste Local

```bash
# Reinicie o dev server
npm run dev
```

Abra http://localhost:3000 e tente:

1. Clique **+ Nova Análise**
2. Selecione aba **✏️ Digitar**
3. Cole uma conversa (ex: abaixo)
4. Clique **✨ Analisar Conversa**

**Conversa de Teste:**
```
10/07/2026, 14:22
Oi! Tudo bem?

10/07/2026, 14:23
Oi! Tudo bem sim. Quero fazer pizza pro aniversário de 50 anos.

10/07/2026, 14:25
Que legal! Quantas pessoas?

10/07/2026, 14:30
Uns 80 pessoas. Queremos variedade de sabor.

10/07/2026, 14:32
Ótimo! Recomendo 25 pizzas, 8 salgadas + 3 doces. Valor: R$ 3.500.

10/07/2026, 14:35
Perfeito! Fecha comigo. Manda por escrito.

10/07/2026, 14:37
Ok! Você é João?

10/07/2026, 14:40
Sim, João Silva. Confirma a data e local depois?

10/07/2026, 14:42
Claro! Qual a data exata?

10/07/2026, 14:45
25 de agosto, em Manaus. Confirmo o local até amanhã.
```

✅ Se aparecer ✅ Análise criada com sucesso! — **Fase 3 concluída**

❌ Se der erro — verifique:
- Que CLAUDE_API_KEY está no `.env.local`
- Que é uma chave **NOVA** (não a compartilhada)
- Que Supabase tabelas foram criadas
- Veja console (F12) para detalhes

---

## FASE 4: Deploy no Vercel

### 4.1 — Setup Vercel

1. Vá para https://vercel.com/dashboard
2. Clique **Add New** > **Project**
3. Selecione seu repo GitHub `viva-platform`
4. Clique **Import**

### 4.2 — Configurar Variáveis de Ambiente

Na página **Configure Project**:

1. Vá para **Environment Variables**
2. Adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGc...`
   - `CLAUDE_API_KEY` = `sk-ant-...` (NOVA)
3. Clique **Deploy**

### 4.3 — Aguardar Deploy

Vercel vai compilar (leva ~3-5 min). Quando terminar, você vai ver:

```
✅ Production ready!
```

Seu site está em: `https://viva-platform.vercel.app` (ou nome customizado)

### 4.4 — Teste em Produção

1. Abra seu URL do Vercel
2. Tente fazer uma análise como fez em local
3. Verifique se aparece no dashboard

✅ **Fase 4 concluída — Produção ativa!**

---

## FASE 5: Configurações Finais (Opcional)

### 5.1 — Custom Domain

Se quiser um domínio próprio (ex: `viva.paletamarketing.com.br`):

1. No Vercel, vá para **Settings** > **Domains**
2. Clique **Add** e digite seu domínio
3. Siga instruções para atualizar DNS no seu registrador

### 5.2 — Supabase Auth (Futuro)

Se implementar login:

1. Vá para **Authentication** no Supabase
2. Configure **Email/Password** ou **OAuth**
3. Teste com usuários de teste (já inseridos no SQL)

---

## 🎯 Checklist Final

- [ ] GitHub repo criado e código commitado
- [ ] Supabase projeto criado
- [ ] Tabelas criadas (SQL rodado)
- [ ] Storage bucket `conversas` criado
- [ ] Claude API Key (NOVA) gerada
- [ ] `.env.local` preenchido completamente
- [ ] Teste local funcionando (análise salva)
- [ ] Vercel projeto importado
- [ ] Variáveis de ambiente no Vercel
- [ ] Deploy no Vercel concluído
- [ ] Análise funciona em produção

---

## 📞 Problemas Comuns

| Problema | Solução |
|----------|---------|
| "CLAUDE_API_KEY not found" | Verifique `.env.local` — ele está na raiz? Reinicie dev server. |
| "Supabase connection error" | Verifique URL/Key em `.env.local`. Projeto Supabase ativo? |
| "Tabelas não existem" | Rode o SQL completo no Supabase SQL Editor. |
| "Deploy falha no Vercel" | Verifique variáveis ambiente em Vercel Settings. |
| "Análise não aparece" | Verifique aba **Network** (F12) — há erro da API? |

---

## 🚀 Próximos Passos

1. **Refinar UI** — Componentes mais bonitos (quando tiver créditos Lovable)
2. **Autenticação** — Login com email/password
3. **WhatsApp API** — Integração futura
4. **Alertas** — Notificações via email/Slack

---

**Status:** ✅ Ready to Ship  
**Versão:** 2.0.0  
**Data:** 15/07/2026

Qualquer dúvida, verifique `README.md` ou veja os logs (F12 > Console).
