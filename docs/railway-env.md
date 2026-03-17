# Variáveis de ambiente no Railway

## Serviço do backend (Node/Express)

No projeto Railway, crie um serviço para o **server** e configure:

| Variável | Obrigatório | Exemplo | Descrição |
|----------|-------------|---------|-----------|
| `DATABASE_URL` | Sim | `postgresql://postgres.XXX:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | URL do pooler Supabase (porta 6543) |
| `DIRECT_URL` | Sim | `postgresql://postgres.XXX:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres` | URL direta para migrações (porta 5432) |
| `JWT_SECRET` | Sim | Uma string longa e aleatória (ex.: `openssl rand -base64 32`) | Segredo para assinar o JWT. **Troque em produção.** |
| `JWT_EXPIRES_IN` | Não | `30m` ou `7d` | Tempo de expiração do token (padrão: 30m) |
| `PORT` | Não | Railway define automaticamente | Porta em que o servidor sobe |

**Onde pegar DATABASE_URL e DIRECT_URL:** Supabase → Project Settings → Database → Connection string → **URI** (modes Transaction e Session).

---

## Build do frontend (Vite estático)

O front usa `VITE_API_URL` em **build time**. No serviço do frontend no Railway:

| Variável | Obrigatório | Exemplo | Descrição |
|----------|-------------|---------|-----------|
| `VITE_API_URL` | Sim | `https://seu-backend.railway.app` | URL pública do backend (sem barra no final). Use a URL que o Railway der ao deploy do server. |

Assim o build do Vite já deixa a API correta no bundle.

---

## Resumo rápido

**Backend (server):**
```
DATABASE_URL=postgresql://postgres.REF:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.REF:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
JWT_SECRET=<gere um segredo forte>
JWT_EXPIRES_IN=30m
```

**Frontend (build):**
```
VITE_API_URL=https://<url-do-seu-backend-no-railway>
```

Depois do primeiro deploy do backend, copie a URL gerada pelo Railway e use em `VITE_API_URL` no serviço do frontend.
