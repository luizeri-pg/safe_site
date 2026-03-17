-- Safe-Site: tabelas para PostgreSQL (Supabase)
-- Execute no SQL Editor do Supabase para criar o schema do app.

-- 1. Empresa (raiz do negócio)
CREATE TABLE IF NOT EXISTS "Empresa" (
  "id"           TEXT PRIMARY KEY,
  "razaoSocial"  TEXT NOT NULL,
  "nomeFantasia" TEXT,
  "cnpj"         TEXT NOT NULL UNIQUE,
  "endereco"     TEXT,
  "telefone"     TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Usuario (auth)
CREATE TABLE IF NOT EXISTS "Usuario" (
  "id"           TEXT PRIMARY KEY,
  "empresaId"    TEXT,
  "email"        TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role"         TEXT NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL
);

-- 3. Solicitacao (listagem unificada)
CREATE TABLE IF NOT EXISTS "Solicitacao" (
  "id"           SERIAL PRIMARY KEY,
  "tipo"         TEXT NOT NULL,
  "referenciaId" TEXT NOT NULL,
  "empresaId"    TEXT NOT NULL,
  "data"         TEXT NOT NULL,
  "status"       TEXT NOT NULL DEFAULT 'Pendente',
  "descricao"    TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Solicitacao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE
);

-- 4. Cat (abertura de CAT)
CREATE TABLE IF NOT EXISTS "Cat" (
  "id"        TEXT PRIMARY KEY,
  "empresaId" TEXT NOT NULL,
  "payload"   TEXT NOT NULL,
  "status"    TEXT NOT NULL DEFAULT 'Pendente',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Cat_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE
);

-- 5. Chamado
CREATE TABLE IF NOT EXISTS "Chamado" (
  "id"                   TEXT PRIMARY KEY,
  "numero"               TEXT,
  "empresaId"            TEXT NOT NULL,
  "titulo"               TEXT NOT NULL,
  "descricao"            TEXT,
  "prioridade"           TEXT NOT NULL,
  "categoria"            TEXT,
  "solicitanteNome"      TEXT,
  "solicitanteEmail"     TEXT,
  "solicitanteTelefone"  TEXT,
  "status"               TEXT NOT NULL DEFAULT 'Aberto',
  "dataAbertura"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Chamado_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE
);

-- 6. Cargo
CREATE TABLE IF NOT EXISTS "Cargo" (
  "id"                  TEXT PRIMARY KEY,
  "empresaId"           TEXT NOT NULL,
  "nomeCargo"           TEXT NOT NULL,
  "cbo"                 TEXT,
  "setor"               TEXT,
  "descricaoAtividades" TEXT,
  "grauRisco"           TEXT,
  "dataSolicitacao"     TEXT,
  "nomeSolicitante"     TEXT,
  "status"              TEXT NOT NULL DEFAULT 'Pendente',
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Cargo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE
);

-- 7. SetorGhe
CREATE TABLE IF NOT EXISTS "SetorGhe" (
  "id"               TEXT PRIMARY KEY,
  "empresaId"        TEXT NOT NULL,
  "nomeSetor"        TEXT NOT NULL,
  "codigoSetor"      TEXT,
  "codigoGhe"        TEXT,
  "descricaoSetor"   TEXT,
  "dataSolicitacao"  TEXT,
  "nomeSolicitante"  TEXT,
  "status"           TEXT NOT NULL DEFAULT 'Pendente',
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SetorGhe_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE
);

-- 8. Unidade
CREATE TABLE IF NOT EXISTS "Unidade" (
  "id"                TEXT PRIMARY KEY,
  "empresaId"         TEXT NOT NULL,
  "nomeUnidade"       TEXT NOT NULL,
  "cnpjUnidade"       TEXT,
  "enderecoUnidade"   TEXT,
  "municipio"         TEXT,
  "uf"                TEXT,
  "telefoneUnidade"   TEXT,
  "dataSolicitacao"   TEXT,
  "nomeSolicitante"   TEXT,
  "status"            TEXT NOT NULL DEFAULT 'Pendente',
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Unidade_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE
);

-- 9. SolicitacaoPpp
CREATE TABLE IF NOT EXISTS "SolicitacaoPpp" (
  "id"        TEXT PRIMARY KEY,
  "empresaId" TEXT NOT NULL,
  "payload"   TEXT NOT NULL,
  "status"    TEXT NOT NULL DEFAULT 'Pendente',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SolicitacaoPpp_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE
);

-- 10. VisitaTecnica
CREATE TABLE IF NOT EXISTS "VisitaTecnica" (
  "id"                   TEXT PRIMARY KEY,
  "empresaId"            TEXT NOT NULL,
  "objetivoVisita"       TEXT,
  "dataPreferencial"     TEXT,
  "enderecoVisita"       TEXT,
  "municipio"            TEXT,
  "uf"                   TEXT,
  "descricaoNecessidade" TEXT,
  "tipoVisita"           TEXT,
  "dataSolicitacao"      TEXT,
  "nomeSolicitante"      TEXT,
  "emailSolicitante"     TEXT,
  "telefoneSolicitante"  TEXT,
  "status"               TEXT NOT NULL DEFAULT 'Pendente',
  "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VisitaTecnica_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE
);

-- Índices úteis para consultas por empresaId
CREATE INDEX IF NOT EXISTS "Usuario_empresaId_idx" ON "Usuario"("empresaId");
CREATE INDEX IF NOT EXISTS "Solicitacao_empresaId_idx" ON "Solicitacao"("empresaId");
CREATE INDEX IF NOT EXISTS "Cat_empresaId_idx" ON "Cat"("empresaId");
CREATE INDEX IF NOT EXISTS "Chamado_empresaId_idx" ON "Chamado"("empresaId");
CREATE INDEX IF NOT EXISTS "Cargo_empresaId_idx" ON "Cargo"("empresaId");
CREATE INDEX IF NOT EXISTS "SetorGhe_empresaId_idx" ON "SetorGhe"("empresaId");
CREATE INDEX IF NOT EXISTS "Unidade_empresaId_idx" ON "Unidade"("empresaId");
CREATE INDEX IF NOT EXISTS "SolicitacaoPpp_empresaId_idx" ON "SolicitacaoPpp"("empresaId");
CREATE INDEX IF NOT EXISTS "VisitaTecnica_empresaId_idx" ON "VisitaTecnica"("empresaId");
