-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ANALISES TABLE
CREATE TABLE IF NOT EXISTS analises (
  id TEXT PRIMARY KEY,
  contato VARCHAR(13),
  cliente_nome VARCHAR(100),
  data_conversa_inicio TIMESTAMP,
  data_ultima_mensagem TIMESTAMP,
  data_upload TIMESTAMP DEFAULT NOW(),
  conversa_original TEXT,
  analise_json JSONB,
  sentimento_score INTEGER,
  sentimento_geral VARCHAR(50),
  versao_prompt VARCHAR(50),
  contexto_snapshot JSONB,
  status VARCHAR(20) DEFAULT 'pendente',
  valor_contrato DECIMAL(10, 2),
  criado_por VARCHAR(255),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  cliente_id VARCHAR(50),
  
  CONSTRAINT unique_analise UNIQUE(contato, data_conversa_inicio)
);

-- Create indexes for analises
CREATE INDEX IF NOT EXISTS idx_analises_contato ON analises(contato);
CREATE INDEX IF NOT EXISTS idx_analises_data_upload ON analises(data_upload DESC);
CREATE INDEX IF NOT EXISTS idx_analises_cliente_id ON analises(cliente_id);

-- Enable RLS for analises
ALTER TABLE analises ENABLE ROW LEVEL SECURITY;

-- RLS Policy: anyone authenticated can read
CREATE POLICY "analises_select_auth" ON analises
  FOR SELECT USING (auth.role() = 'authenticated_user');

-- 2. CONFIG TABLE
CREATE TABLE IF NOT EXISTS config (
  id TEXT PRIMARY KEY DEFAULT 'loppifest',
  analises_mes INTEGER DEFAULT 50,
  nivel INTEGER DEFAULT 1,
  pode_enviar_conversa BOOLEAN DEFAULT true,
  ve_inteligencia BOOLEAN DEFAULT true,
  ve_configuracoes BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_select_auth" ON config
  FOR SELECT USING (auth.role() = 'authenticated_user');

-- Insert default config
INSERT INTO config (id) VALUES ('loppifest')
ON CONFLICT (id) DO NOTHING;

-- 3. CONTEXTO_EMPRESA TABLE
CREATE TABLE IF NOT EXISTS contexto_empresa (
  id TEXT PRIMARY KEY DEFAULT 'loppifest',
  nome_empresa VARCHAR(255),
  posicionamento TEXT,
  objecoes_mapeadas JSONB,
  tom_recomendado TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE contexto_empresa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contexto_empresa_select_auth" ON contexto_empresa
  FOR SELECT USING (auth.role() = 'authenticated_user');

-- Insert default context
INSERT INTO contexto_empresa (id, nome_empresa, posicionamento)
VALUES ('loppifest', 'Loppifest', 'Pizzaria especializada em levar pizzaiolo ao vivo para eventos')
ON CONFLICT (id) DO NOTHING;

-- 4. USO TABLE (monthly usage tracking)
CREATE TABLE IF NOT EXISTS uso (
  mes VARCHAR(7) PRIMARY KEY,
  contagem INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE uso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uso_select_auth" ON uso
  FOR SELECT USING (auth.role() = 'authenticated_user');

-- 5. USERS_ROLES TABLE
CREATE TABLE IF NOT EXISTS users_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  empresa VARCHAR(50),
  papel VARCHAR(20),
  pode_analisar BOOLEAN DEFAULT true,
  pode_deletar BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_roles_select_own" ON users_roles
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Insert default users
INSERT INTO users_roles (email, empresa, papel, pode_analisar, pode_deletar)
VALUES
  ('luiz@paletamarketing.com.br', 'Paleta', 'master', true, true),
  ('julia.paletamarketing@gmail.com', 'Paleta', 'suporte', true, false),
  ('lavdneto@gmail.com', 'Loppifest', 'cliente', true, false)
ON CONFLICT (email) DO NOTHING;

-- Create PROMPTS table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  versao VARCHAR(50) NOT NULL UNIQUE,
  conteudo TEXT NOT NULL,
  ativa BOOLEAN DEFAULT false,
  criado_em TIMESTAMP DEFAULT NOW()
);

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prompts_select_auth" ON prompts
  FOR SELECT USING (auth.role() = 'authenticated_user');

-- Create LOGS table
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acao VARCHAR(100),
  usuario VARCHAR(255),
  detalhes JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "logs_select_master_only" ON logs
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'luiz@paletamarketing.com.br'
  );
