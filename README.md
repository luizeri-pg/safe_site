# Safe Site

Aplicação com tela de login e autenticação Bearer (expiração 30 minutos).

## Configuração

1. Instale as dependências (já feito se você rodou o projeto):

   ```bash
   npm install
   ```

2. **API de login:**
   - **Mock local (testes):** deixe `VITE_API_URL` vazio ou use `http://localhost:5173`. O Vite responde a `POST /auth/login` com um token fake. Qualquer usuário/senha funciona.
   - **API real:** no `.env`, defina `VITE_API_URL=https://sua-api.com` (só a origem, sem `/auth/login`).

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
