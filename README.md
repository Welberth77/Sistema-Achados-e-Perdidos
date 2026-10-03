# Sistema de Achados e Perdidos

Aplicação web para gestão de itens achados, custódia e devolução.

- **Frontend:** React + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express (API REST, autenticação JWT)
- **Banco:** PostgreSQL

## Pré-requisitos

- Node.js LTS (ver `.nvmrc` — use `nvm use`)
- PostgreSQL instalado e rodando
- Git

## Como rodar

Clone o repositório e configure cada app:

### Backend
```bash
cd backend
cp .env.example .env        # ajuste as variáveis
npm install
npm run dev                 # sobe em http://localhost:3000
```
Teste: `GET http://localhost:3000/api/health` deve responder `{ "status": "ok" }`.

### Frontend
```bash
cd frontend
cp .env.example .env        # ajuste VITE_API_URL se necessário
npm install
npm run dev                 # sobe em http://localhost:5173
```

## Estrutura

```
achados-e-perdidos/
├── frontend/   # React (Vite + Tailwind + Router)
└── backend/    # Node + Express (API REST)
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
