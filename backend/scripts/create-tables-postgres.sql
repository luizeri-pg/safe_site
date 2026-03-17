-- Safe-Site: cria todas as tabelas no PostgreSQL
-- Execute no banco safesite (ex.: psql -U luizeri -d safesite -f create-tables-postgres.sql)
-- Se as tabelas já existirem (criadas pelo backend com EnsureCreated), este script falhará; nesse caso não é necessário rodá-lo.

BEGIN;

-- 1. Empresas (sem FK)
CREATE TABLE IF NOT EXISTS empresas (
    id TEXT NOT NULL PRIMARY KEY,
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT,
    cnpj TEXT NOT NULL UNIQUE,
    endereco TEXT,
    telefone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- 2. Usuários (FK → empresas)
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT NOT NULL PRIMARY KEY,
    empresa_id TEXT REFERENCES empresas(id) ON DELETE SET NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);
CREATE INDEX IF NOT EXISTS ix_usuarios_empresa_id ON usuarios(empresa_id);

-- 3. Solicitações (listagem unificada; FK → empresas)
CREATE TABLE IF NOT EXISTS solicitacoes (
    id SERIAL PRIMARY KEY,
    tipo TEXT NOT NULL,
    referencia_id TEXT NOT NULL,
    empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);
CREATE INDEX IF NOT EXISTS ix_solicitacoes_empresa_id ON solicitacoes(empresa_id);

-- 4. CAT (FK → empresas)
CREATE TABLE IF NOT EXISTS cats (
    id TEXT NOT NULL PRIMARY KEY,
    empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    payload TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);
CREATE INDEX IF NOT EXISTS ix_cats_empresa_id ON cats(empresa_id);

-- 5. Chamados (FK → empresas)
CREATE TABLE IF NOT EXISTS chamados (
    id TEXT NOT NULL PRIMARY KEY,
    numero TEXT,
    empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    prioridade TEXT NOT NULL DEFAULT 'Média',
    categoria TEXT,
    solicitante_nome TEXT,
    solicitante_email TEXT,
    solicitante_telefone TEXT,
    status TEXT NOT NULL DEFAULT 'Aberto',
    data_abertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);
CREATE INDEX IF NOT EXISTS ix_chamados_empresa_id ON chamados(empresa_id);

-- 6. Cargos (FK → empresas)
CREATE TABLE IF NOT EXISTS cargos (
    id TEXT NOT NULL PRIMARY KEY,
    empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome_cargo TEXT NOT NULL,
    cbo TEXT,
    setor TEXT,
    descricao_atividades TEXT,
    grau_risco TEXT,
    data_solicitacao TEXT,
    nome_solicitante TEXT,
    status TEXT NOT NULL DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);
CREATE INDEX IF NOT EXISTS ix_cargos_empresa_id ON cargos(empresa_id);

-- 7. Setor GHE (FK → empresas)
CREATE TABLE IF NOT EXISTS setor_ghe (
    id TEXT NOT NULL PRIMARY KEY,
    empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome_setor TEXT NOT NULL,
    codigo_setor TEXT,
    codigo_ghe TEXT,
    descricao_setor TEXT,
    data_solicitacao TEXT,
    nome_solicitante TEXT,
    status TEXT NOT NULL DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);
CREATE INDEX IF NOT EXISTS ix_setor_ghe_empresa_id ON setor_ghe(empresa_id);

-- 8. Unidades (FK → empresas)
CREATE TABLE IF NOT EXISTS unidades (
    id TEXT NOT NULL PRIMARY KEY,
    empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome_unidade TEXT NOT NULL,
    cnpj_unidade TEXT,
    endereco_unidade TEXT,
    municipio TEXT,
    uf TEXT,
    telefone_unidade TEXT,
    data_solicitacao TEXT,
    nome_solicitante TEXT,
    status TEXT NOT NULL DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);
CREATE INDEX IF NOT EXISTS ix_unidades_empresa_id ON unidades(empresa_id);

-- 9. Solicitação PPP (FK → empresas)
CREATE TABLE IF NOT EXISTS solicitacao_ppp (
    id TEXT NOT NULL PRIMARY KEY,
    empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    payload TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);
CREATE INDEX IF NOT EXISTS ix_solicitacao_ppp_empresa_id ON solicitacao_ppp(empresa_id);

-- 10. Visita Técnica (FK → empresas)
CREATE TABLE IF NOT EXISTS visita_tecnica (
    id TEXT NOT NULL PRIMARY KEY,
    empresa_id TEXT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    objetivo_visita TEXT,
    data_preferencial TEXT,
    endereco_visita TEXT,
    municipio TEXT,
    uf TEXT,
    descricao_necessidade TEXT,
    tipo_visita TEXT,
    data_solicitacao TEXT,
    nome_solicitante TEXT,
    email_solicitante TEXT,
    telefone_solicitante TEXT,
    status TEXT NOT NULL DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);
CREATE INDEX IF NOT EXISTS ix_visita_tecnica_empresa_id ON visita_tecnica(empresa_id);

COMMIT;

-- Resumo das tabelas (para consumo pelo backend e relatórios):
-- empresas          -> cadastro de empresas
-- usuarios          -> login (email + password_hash), vínculo com empresa
-- solicitacoes      -> listagem unificada (Acompanhamento)
-- cats              -> abertura de CAT
-- chamados          -> abertura de chamado
-- cargos            -> inclusão de cargo
-- setor_ghe         -> inclusão setor/GHE
-- unidades          -> inclusão nova unidade
-- solicitacao_ppp   -> solicitação PPP
-- visita_tecnica    -> solicitação visita técnica
