# Sistema de Achados e Perdidos

Aplicação web para gestão de itens achados, custódia e devolução.

- **Frontend:** React + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express (API REST, autenticação JWT)
- **Banco:** PostgreSQL
- **Infra:** Docker + Docker Compose

## Pré-requisitos

- [Docker](https://www.docker.com/) instalado e em execução (inclui o Docker Compose)
- Node.js LTS (ver `.nvmrc` — use `nvm use`) — apenas para rodar o frontend
- Git

## Como rodar

O **banco** e o **backend** rodam em contêineres Docker. O **frontend** roda localmente.

### 1. Banco + Backend (Docker)

Na raiz do projeto:

```bash
docker compose up -d        # sobe o PostgreSQL e o backend
docker compose logs -f      # (opcional) acompanha os logs
```

Na primeira subida, o banco é criado e os scripts de `db/init/` aplicam o schema e os
dados iniciais automaticamente — não é preciso instalar PostgreSQL nem rodar nada à mão.

Teste: `GET http://localhost:3000/api/health` deve responder `{ "status": "ok" }`.

Comandos úteis:
```bash
docker compose down         # para os contêineres (mantém os dados do banco)
docker compose down -v      # para e APAGA o banco (reaplica schema/seed na próxima subida)
docker compose build        # reconstrói a imagem do backend após mudar dependências
```

### 2. Frontend (local)

```bash
cd frontend
cp .env.example .env         # VITE_API_URL já aponta para http://localhost:3000/api
npm install
npm run dev                  # sobe em http://localhost:5173
```

### Acesso inicial

- **Banco:** `achados_perdidos` · usuário `app_achados` · senha `1234` · `localhost:5432`
- **Login (admin):** e-mail `admin@achados.local` · senha `admin123`

> Senhas são padrão de **desenvolvimento** — troque em produção.

## Estrutura

```
Sistema-Achados-e-Perdidos/
├── docker-compose.yml   # sobe banco + backend
├── db/
│   └── init/            # schema e seed aplicados na 1ª subida do banco
├── frontend/            # React (Vite + Tailwind + Router)
└── backend/             # Node + Express (API REST) + Dockerfile
```

## Convenções

**Branches**
- `main` — protegida. Nada entra sem Pull Request + 1 revisão.
- `feat/<assunto>` — novas funcionalidades (ex.: `feat/tela-login`)
- `fix/<assunto>` — correções
- `chore/<assunto>` — configuração/infra

**Commits** (Conventional Commits)
- `feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`, `refactor: ...`

**Fluxo**
1. Crie sua branch a partir da `main` atualizada.
2. Faça commits pequenos e descritivos.
3. Abra o PR, peça revisão, resolva comentários, faça o merge.

## Padrões de código
- ESLint + Prettier configurados em cada app.
- `npm run lint` e `npm run format` antes de abrir PR.
