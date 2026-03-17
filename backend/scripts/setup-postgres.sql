-- Safe-Site: cria o banco no PostgreSQL
-- Rode uma vez antes de subir a API em C#.
-- As tabelas são criadas automaticamente pelo backend na primeira execução (EnsureCreatedAsync).
--
-- No terminal (a partir da pasta backend/scripts ou informando o caminho):
--   psql -U postgres -f setup-postgres.sql

CREATE DATABASE safesite;

COMMENT ON DATABASE safesite IS 'Banco do Safe-Site (backend C#)';
