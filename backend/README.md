# Safe-Site Backend (C# + PostgreSQL)

API em **ASP.NET Core 8** com **PostgreSQL**. Todos os dados exibidos no front vêm do BD e do backend; o front apenas envia submissões e consome as APIs.

## Requisitos

- **.NET 8 SDK**
- **PostgreSQL** (local ou remoto)

## Configuração

1. Crie o banco no PostgreSQL (ex.: `createdb safesite` ou pelo pgAdmin).
2. Ajuste a connection string em `SafeSite.Api/appsettings.json` ou `appsettings.Development.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=safesite;Username=postgres;Password=SUA_SENHA;Port=5432"
}
```

3. (Opcional) Ajuste o JWT em `appsettings.json`:

```json
"Jwt": {
  "Secret": "sua-chave-secreta-muito-longa-minimo-32-caracteres",
  "Issuer": "SafeSite",
  "Audience": "SafeSite",
  "ExpiresInMinutes": 30
}
```

## Como rodar

```bash
cd backend/SafeSite.Api
dotnet restore
dotnet run
```

Em **Development**, o app usa `EnsureCreatedAsync()` na primeira execução para criar as tabelas no PostgreSQL e em seguida roda o **seed** (1 empresa + 2 usuários).

- **admin@safesite.com** — role `admin` (vê **todas** as solicitações em GET /api/solicitacoes)
- **cliente@empresaalpha.com** — role `client` (vinculado à Empresa Alpha), senha **admin123**
- **safe.teste** — role `client` (vinculado à Safe Gestão), senha **safeteste**

A API sobe em **http://localhost:3001**. No front, configure no `.env` da raiz do projeto:

```
VITE_API_URL=http://localhost:3001
```

## Migrations (opcional)

Para usar **migrations** em vez de `EnsureCreated`:

```bash
cd backend/SafeSite.Api
dotnet ef migrations add InitialCreate
dotnet ef database update
```

Requer o pacote de ferramentas: `dotnet tool install --global dotnet-ef`

## Endpoints

- **POST /auth/login** — Login (body: `username`, `password`). Retorna `access_token` e dados da empresa.
- **GET /api/solicitacoes** — Listagem unificada (Acompanhamento). Query: `tipo`, `status`, `busca`. Requer Bearer token.
- **PATCH /api/solicitacoes/{id}** — Atualiza `status` e/ou `descricao`. Requer Bearer token.

Recursos por entidade (todos com Bearer token):

| Recurso            | GET (lista) | GET /:id | POST (criar) |
|--------------------|-------------|----------|--------------|
| /api/cats          | Sim         | Sim      | payload      |
| /api/chamados      | Sim         | Sim      | empresa, chamado, solicitante |
| /api/cargos        | Sim         | Sim      | empresa, cargo, solicitacao   |
| /api/setores-ghe   | Sim         | Sim      | empresa, setorGhe, solicitacao |
| /api/unidades      | Sim         | Sim      | empresa, unidade, solicitacao  |
| /api/ppp           | Sim         | Sim      | payload      |
| /api/visitas       | Sim         | Sim      | empresa, visita, solicitacao   |

Respostas em JSON usam **snake_case** (ex.: `empresa_id`, `access_token`) para compatibilidade com o frontend.
