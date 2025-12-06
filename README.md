# PostAngelo - Portfolio CMS

Sistema de portfolio com editor visual de blocos (estilo Elementor).

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: Express, TypeScript, TypeORM, PostgreSQL
- **Cache/Sessions**: Redis
- **Editor**: React + dnd-kit (drag-and-drop), sistema de blocos com JSON

## Requisitos

- Node.js >= 18
- pnpm >= 8
- Docker e Docker Compose (para desenvolvimento local)

## Setup Desenvolvimento

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

### 3. Iniciar serviços (Postgres + Redis)

```bash
docker-compose up -d db redis
```

### 4. Rodar migrações e seeds

```bash
cd backend
pnpm seed
```

### 5. Iniciar aplicação

```bash
# Na raiz do projeto
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

## Credenciais Admin (desenvolvimento)

- Email: `admin@postangelo.com`
- Senha: `admin123`

## Estrutura do Projeto

```
postangelo/
├── frontend/              # Next.js App
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   │   ├── blocks/       # Block components (Hero, Text, etc.)
│   │   ├── editor/       # Editor components
│   │   └── ui/           # shadcn/ui components
│   └── lib/              # Utilities, API, store
├── backend/              # Express API
│   └── src/
│       ├── entities/     # TypeORM entities
│       ├── routes/       # API routes
│       ├── middlewares/  # Auth, error handling
│       ├── services/     # Auth, Redis services
│       └── seeds/        # Database seeds
├── docker-compose.yml
└── package.json
```

## Blocos Disponíveis

1. **Hero** - Seção hero com título, subtítulo, imagem de fundo
2. **Text Block** - Bloco de texto com rich text
3. **Services Grid** - Grid de serviços com ícones

## API Endpoints

### Públicos
- `GET /api/pages` - Listar páginas publicadas
- `GET /api/pages/:slug` - Obter página por slug

### Admin (requer autenticação)
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/pages` - Criar página
- `PUT /api/pages/:id` - Atualizar página
- `DELETE /api/pages/:id` - Deletar página
- `POST /api/admin/uploads` - Upload de arquivo
- `GET /api/admin/block-templates` - Listar templates de blocos

## Deploy (Coolify)

1. Configurar variáveis de ambiente no Coolify:
   - `POSTGRES_URL`
   - `REDIS_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`

2. Criar volume para uploads: `/data/uploads`

3. Configurar build:
   - Backend: `pnpm install && pnpm build && pnpm start`
   - Frontend: `pnpm install && pnpm build && pnpm start`
