# Railway — Monorepo (front + back)

Use **dois serviços** no mesmo projeto Railway, ambos apontando para este repositório.

---

## Onde criar o serviço do backend (passo a passo)

Você já tem um serviço (o frontend em `safesite-production.up.railway.app`). O backend é **outro serviço**, no **mesmo projeto**:

1. Abra o **projeto** no Railway (onde está o serviço do frontend).
2. No canto **superior direito**, clique em **"+ New"** ou **"+ Create"** (botão para adicionar algo ao projeto).
3. Escolha **"Empty Service"** (ou **"GitHub Repo"** se aparecer — aí selecione o **mesmo repositório** Safe-Site de novo).
   - **Se criou Empty Service:** depois, em **Settings** desse novo serviço, em **Source**, conecte o **mesmo repositório** do GitHub (Safe-Site).
4. **Renomeie** o novo serviço (clique com botão direito no card do serviço ou em Settings) para algo como **safe-site-api** ou **backend**.
5. Em **Settings** desse serviço:
   - **Root Directory:** se existir, coloque `server`. **Se não achar**, use os comandos abaixo que já entram na pasta `server`.
   - **Build Command:** `cd server && pnpm install && npx prisma generate && pnpm run build`
   - **Start Command:** `cd server && pnpm run start`
6. Na aba **Variables**, adicione `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN` (valores no bloco “Backend — Variables” mais abaixo).
7. Em **Settings** → **Networking** (ou na aba de rede do serviço), clique em **"Generate Domain"** para gerar a URL pública do backend (ex.: `https://safe-site-api-production-xxxx.up.railway.app`).
8. Copie essa URL do backend e, no **serviço do frontend**, em **Variables**, defina `VITE_API_URL` com ela. Faça um **novo deploy** do frontend.

O serviço do backend fica **ao lado** do serviço do frontend no mesmo projeto (dois retângulos/cards no painel).

---

**Importante:** Cada serviço gera uma URL diferente. A URL do **frontend** (site estático) não responde a POST `/auth/login` — quem responde é o **backend**. Por isso `VITE_API_URL` no frontend deve ser sempre a **URL do serviço do backend**, não a URL do frontend. Se você usar a URL do front em `VITE_API_URL`, o login dará **405 Method Not Allowed**.

---

## Serviço 1: Backend (API)

| Campo | Valor |
|-------|--------|
| **Nome** | `safe-site-api` (ou o que preferir) |
| **Root Directory** | `server` (se achar nas Settings; senão deixe em branco) |
| **Build Command** | `cd server && pnpm install && npx prisma generate && pnpm run build` |
| **Start Command** | `cd server && pnpm run start` |
| **Watch Paths** | `server/**` (opcional) |

### Variáveis de ambiente (Backend)

Adicione no painel **Variables** deste serviço:

```
DATABASE_URL=postgresql://postgres.TROQUE_REF:TROQUE_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.TROQUE_REF:TROQUE_SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
JWT_SECRET=TROQUE_POR_UM_SEGREDO_FORTE_32_CHARS
JWT_EXPIRES_IN=30m
```

- Troque `TROQUE_REF` pelo **Project ref** do Supabase (ex.: `tzyvsqyyrsaulryfjnne`).
- Troque `TROQUE_SENHA` pela senha do banco (Supabase → Project Settings → Database).
- Troque `JWT_SECRET` por uma string longa e aleatória (ex.: `openssl rand -base64 32`).
- **Não** defina `PORT` — o Railway injeta automaticamente.

Depois do deploy, copie a **URL pública** do backend (ex.: `https://safe-site-api-production-xxxx.up.railway.app`) para usar no frontend.

---

## Serviço 2: Frontend (Vite)

| Campo | Valor |
|-------|--------|
| **Nome** | `safe-site-web` (ou o que preferir) |
| **Root Directory** | *(deixe vazio = raiz do repo)* |
| **Build Command** | `pnpm install && pnpm run build` |
| **Output Directory** | `dist` |
| **Watch Paths** | `src/**`, `index.html`, `vite.config.*`, `package.json` (opcional) |

Se o Railway pedir **Start Command** em vez de “Output Directory”, use um comando que sirva estáticos, por exemplo:

`npx serve dist -s -l 3000`

(ou o Railway pode detectar “static site” e usar só **Output Directory** = `dist`)

### Variáveis de ambiente (Frontend)

Adicione **antes do primeiro build** (o Vite embute no build):

```
VITE_API_URL=https://heartfelt-analysis-production-9a6e.up.railway.app
```

- Troque pela URL real do **Serviço 1 (Backend)** no Railway, **sem** barra no final.
- Exemplo: `https://heartfelt-analysis-production-9a6e.up.railway.app`

---

## Ordem recomendada

1. Criar e fazer deploy do **Backend** (Serviço 1) com as variáveis acima.
2. Copiar a URL pública do backend.
3. Criar o **Frontend** (Serviço 2) e definir `VITE_API_URL` com essa URL.
4. Fazer o deploy do frontend.

---

## Resumo copy-paste

**Backend — Variables:**
```
DATABASE_URL=postgresql://postgres.TROQUE_REF:TROQUE_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.TROQUE_REF:TROQUE_SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
JWT_SECRET=TROQUE_POR_UM_SEGREDO_FORTE_32_CHARS
JWT_EXPIRES_IN=30m
```

**Frontend — Variables:**
```
VITE_API_URL=https://heartfelt-analysis-production-9a6e.up.railway.app
```

**Backend — Settings:**
- Root Directory: `server`
- Build: `cd server && pnpm install && npx prisma generate && pnpm run build`
- Start: `cd server && pnpm run start`

**Frontend — Settings:**
- Root Directory: *(raiz do repo)*
- Build: `pnpm install && pnpm run build`
- Output Directory: `dist` (ou Start: `npx serve dist -s -l 3000` se pedir comando de start)
