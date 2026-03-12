# SafeSite API (Backend em C#)

API ASP.NET Core 8 com autenticação JWT e endpoints para login e listagem de solicitações.

## Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

## Executar

```bash
cd backend/SafeSite.Api
dotnet run
```

A API sobe em **http://localhost:5000**. O Swagger fica em http://localhost:5000/swagger.

## Conectar o frontend

No projeto React (raiz do repositório), crie ou edite `.env`:

```
VITE_API_URL=http://localhost:5000
```

Reinicie o `npm run dev` do frontend. O login e a listagem de solicitações passarão a usar a API em C# em vez do mock.

**Importante:** desative o mock de auth no Vite quando estiver usando o backend real (comente ou remova o `mockAuthPlugin()` em `vite.config.ts`).

## Usuários de teste (seed)

| Usuário   | Senha  | Perfil  |
|-----------|--------|---------|
| admin     | admin  | admin   |
| cliente1  | 123    | client  |
| cliente2  | 123    | client  |

- **admin**: vê o menu "Acompanhamento" e pode listar todas as solicitações.
- **client**: vê apenas a área do cliente (criar solicitações, etc.).

## Endpoints

- **POST /auth/login** – Login (body: `{ "username", "password" }`). Retorna `resultado.access_token` e `resultado.role`.
- **GET /api/solicitacoes** – Lista todas as solicitações (requer token e role admin). Query: `tipo`, `status`, `busca`.

## Banco de dados

Por padrão usa SQLite com arquivo `safesite.db` na pasta do projeto. As tabelas são criadas automaticamente na primeira execução, com usuários e solicitações de exemplo.

Para trocar para SQL Server ou outro provedor, altere a connection string em `appsettings.json` e o pacote EF no `.csproj`.
