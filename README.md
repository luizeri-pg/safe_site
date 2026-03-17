# Safe Site

Aplicação com tela de login e autenticação Bearer (expiração 30 minutos).

## Configuração

1. Instale as dependências (já feito se você rodou o projeto):

   ```bash
   npm install
   ```

2. **API de login e backend:**
   - **Mock local (testes):** deixe `VITE_API_URL` vazio ou use `http://localhost:5173`. O Vite responde a `POST /auth/login` com um token fake. Qualquer usuário/senha funciona.
   - **API real (backend do projeto):** o backend está em **C# (ASP.NET Core)** com **PostgreSQL**. Veja a pasta **`backend/`** e o `backend/README.md`. Configure `VITE_API_URL=http://localhost:3001` no `.env` da raiz, suba o PostgreSQL, ajuste a connection string no backend e rode `dotnet run` em `backend/SafeSite.Api`. Todos os dados das telas vêm do BD e da API; o front só envia submissões e consome as rotas.
   - **Outra API:** no `.env`, defina `VITE_API_URL=https://sua-api.com` (só a origem, sem `/auth/login`).

## Acesso (backend C#)

Após subir o backend e configurar `VITE_API_URL`:

| Perfil   | Usuário                   | Senha     | Uso |
|----------|---------------------------|-----------|-----|
| **Admin**| `admin@safesite.com`      | `admin123`| Acompanhamento de **todas** as solicitações |
| Cliente  | `cliente@empresaalpha.com`| `admin123`| Área do cliente (Empresa Alpha) |
| Cliente  | `safe.teste`              | `safeteste`| Área do cliente (Safe Gestão) |

A rota inicial redireciona: **admin** → `/acompanhamento`; **cliente** → Dashboard.

## Login

- **Rota:** `POST /auth/login`
- **Request:** `{ "username": "...", "password": "..." }`
- **Response:** `sucesso`, `resultado.access_token`, `resultado.expires_in`, `resultado.token_type`
- O token é armazenado no `localStorage` e considerado válido por **30 minutos** (mesmo que a API retorne `expires_in` maior).

## Uso do token em outras APIs

Nos componentes, use o contexto de autenticação:

```tsx
import { useAuth } from './contexts/AuthContext';
import { getAuthHeaders } from './services/api';

function MeuComponente() {
  const { token } = useAuth();

  const res = await fetch(`${API_BASE}/outra-rota`, {
    headers: getAuthHeaders(token),
  });
  // ...
}
```

## Rodar o projeto

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). Rotas:

- `/` – área autenticada (redireciona para `/login` se não houver token válido)
- `/login` – tela de login

## Build

```bash
npm run build
```
