# Safe-Site Backend

API e banco de dados do Safe-Site. **Todos os dados exibidos no front vêm do BD e do backend**; o front apenas envia submissões e consome as APIs.

## Stack

- **Node.js** + **Express** (TypeScript)
- **Prisma** + **SQLite** (troque para PostgreSQL em produção se quiser)
- **JWT** para autenticação
- **bcrypt** para hash de senha

## Variáveis de ambiente

Crie um arquivo `.env` na pasta `server/` (copie de `.env.example`):

| Variável        | Descrição                          | Exemplo                    |
|-----------------|------------------------------------|----------------------------|
| `DATABASE_URL`  | URL do banco (SQLite ou PostgreSQL)| `file:./prisma/dev.db`     |
| `JWT_SECRET`    | Chave para assinatura do JWT       | string longa e aleatória   |
| `JWT_EXPIRES_IN`| Expiração do token                 | `30m`                      |
| `PORT`          | Porta da API                       | `3001`                     |

Para SQLite, use por exemplo:

```env
DATABASE_URL="file:./dev.db"
```

(O arquivo `dev.db` será criado na pasta `prisma/` ao rodar `db:push`.)

## Como rodar

```bash
cd server
npm install
cp .env.example .env
# Edite .env se precisar (JWT_SECRET, PORT)
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

A API sobe em `http://localhost:3001`. No front, configure `VITE_API_URL=http://localhost:3001` no `.env` do projeto raiz.

## Endpoints

- **POST /auth/login** — Login (body: `username`, `password`). Retorna `access_token` e dados da empresa do usuário.
- **GET /api/solicitacoes** — Listagem unificada (Acompanhamento). Query: `tipo`, `status`, `busca`. Requer Bearer token.
- **PATCH /api/solicitacoes/:id** — Atualiza `status` e/ou `descricao` da solicitação. Requer Bearer token.

Por entidade (todos exigem Bearer token):

| Recurso           | GET (lista)   | GET /:id | POST (criar)     |
|-------------------|---------------|----------|------------------|
| /api/cats         | Sim           | Sim      | Body: payload    |
| /api/chamados     | Sim           | Sim      | Body: empresa, chamado, solicitante |
| /api/cargos      | Sim           | Sim      | Body: empresa, cargo, solicitacao  |
| /api/setores-ghe | Sim           | Sim      | Body: empresa, setorGhe, solicitacao |
| /api/unidades    | Sim           | Sim      | Body: empresa, unidade, solicitacao |
| /api/ppp         | Sim           | Sim      | Body: payload    |
| /api/visitas     | Sim           | Sim      | Body: empresa, visita, solicitacao  |

Ao criar qualquer entidade, o backend também insere um registro na tabela **Solicitacao** (para a tela de Acompanhamento). Cliente vê apenas solicitações da própria empresa; admin vê todas.

## Seed

- **admin@safesite.com** — role `admin`, sem empresa fixa.
- **cliente@empresaalpha.com** — role `client`, vinculado à Empresa Alpha.
- Senha para ambos: **admin123**.

## Banco de dados (Prisma)

Modelos principais: **Empresa**, **Usuario**, **Solicitacao** (listagem unificada), **Cat**, **Chamado**, **Cargo**, **SetorGhe**, **Unidade**, **SolicitacaoPpp**, **VisitaTecnica**. O schema está em `prisma/schema.prisma`.

Para migrar para PostgreSQL: altere `provider` e `url` em `schema.prisma`, crie o DB e rode `npx prisma migrate dev`.
