# Configurar PostgreSQL para o Safe-Site

O backend em C# usa **PostgreSQL** e **.NET 8**. Só é preciso **criar o banco**; as tabelas são criadas automaticamente na primeira vez que você rodar a API.

## 1. Instalar o .NET 8 SDK (para rodar o backend C#)

- **macOS (Homebrew):**
  ```bash
  brew install dotnet@8
  ```
  Depois pode ser preciso vincular: `brew link dotnet@8` ou adicionar ao PATH (o Homebrew mostra a mensagem ao final da instalação).
- **Ou baixe o instalador:** [.NET 8 – Download](https://dotnet.microsoft.com/download/dotnet/8.0) (escolha “macOS” e “SDK”).

No terminal, confira:
```bash
dotnet --version
```
Deve aparecer algo como `8.0.x`.

## 2. Instalar o PostgreSQL

- **macOS (Homebrew):** `brew install postgresql@16` e depois `brew services start postgresql@16`
- **Windows:** [PostgreSQL Installer](https://www.postgresql.org/download/windows/)
- **Linux (Ubuntu/Debian):** `sudo apt install postgresql postgresql-contrib`

## 3. Criar o banco `safesite`

Escolha uma das formas abaixo.

### Opção A: Pelo terminal (psql)

No **macOS com Homebrew**, o PostgreSQL costuma criar um usuário com o **mesmo nome do seu usuário do sistema** (ex.: `luizeri`), e não `postgres`. Se der erro `role "postgres" does not exist`, use seu usuário do Mac. E **conecte no banco padrão** `postgres`, senão pode dar `database "luizeri" does not exist`:

```bash
# -U seu usuário, -d postgres (banco que já existe) e depois cria o safesite
psql -U luizeri -d postgres -c "CREATE DATABASE safesite;"
```

Se na sua instalação existir o usuário `postgres`:

```bash
psql -U postgres -c "CREATE DATABASE safesite;"
```

Ou entrar no psql e criar o banco:

```bash
psql -U luizeri   # ou postgres
# Dentro do psql:
CREATE DATABASE safesite;
\q
```

Script do projeto (troque `luizeri` pelo seu usuário se precisar):

```bash
psql -U luizeri -f backend/scripts/setup-postgres-simple.sql
```

### Opção B: Pelo pgAdmin (interface gráfica)

1. Abra o pgAdmin e conecte no servidor (localhost, usuário `postgres`).
2. Clique com o botão direito em **Databases** → **Create** → **Database**.
3. Em **Database** coloque: `safesite`.
4. Clique em **Save**.

## 4. Ajustar a connection string no backend

No arquivo **`backend/SafeSite.Api/appsettings.Development.json`** (ou `appsettings.json`), confira:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=safesite;Username=SEU_USUARIO;Password=SUA_SENHA;Port=5432"
}
```

- **Username:** no macOS (Homebrew) use o mesmo usuário que você usou no `psql` (ex.: `luizeri`), não necessariamente `postgres`.
- **Password:** no Homebrew muitas vezes o usuário local não tem senha; nesse caso use `Password=` vazio ou omita. Se tiver senha, coloque aqui.
- A porta padrão é `5432`.

## 5. Criar as tabelas e rodar a API

**Opção A – Subir a API (recomendado)**  
Ao rodar o backend, na primeira execução ele cria todas as tabelas com `EnsureCreatedAsync()` e roda o seed (empresas e usuários iniciais):

```bash
cd backend/SafeSite.Api
dotnet run
```

**Opção B – Script SQL manual (opcional)**  
Para criar as tabelas sem subir a API (ex.: outro servidor, CI), execute no banco `safesite`:

```bash
psql -U luizeri -d safesite -f backend/scripts/create-tables-postgres.sql
```

O script usa `CREATE TABLE IF NOT EXISTS`; depois rode a API para o seed preencher os dados iniciais.

## Resumo das tabelas (consumo pelo backend)

| Tabela | Uso |
|--------|-----|
| `empresas` | Cadastro de empresas (CNPJ, razão social, etc.) |
| `usuarios` | Login (email, password_hash), vínculo com empresa |
| `solicitacoes` | Listagem unificada (tela de Acompanhamento) |
| `cats` | Abertura de CAT |
| `chamados` | Abertura de chamado |
| `cargos` | Inclusão de cargo |
| `setor_ghe` | Inclusão setor/GHE |
| `unidades` | Inclusão nova unidade |
| `solicitacao_ppp` | Solicitação PPP |
| `visita_tecnica` | Solicitação visita técnica |

## Resumo

| O que fazer | Onde |
|-------------|------|
| Instalar .NET 8 SDK | `brew install dotnet@8` ou site da Microsoft |
| Criar o banco `safesite` | PostgreSQL (psql ou pgAdmin) |
| Colocar usuário/senha corretos | `appsettings.Development.json` → `DefaultConnection` |
| Criar tabelas | Automático ao rodar `dotnet run` na 1ª vez, ou script `backend/scripts/create-tables-postgres.sql` |
| Dados iniciais (seed) | Automático ao rodar `dotnet run` em Development |
