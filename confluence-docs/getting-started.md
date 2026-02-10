# Getting started

This page helps developers get the My Swayamvar project running locally.

## Prerequisites

- **Node.js** 20 or later
- **npm** (comes with Node)
- **PostgreSQL** and **Redis** running locally, or use **Docker** to run the full stack

## Quick start (API + Web with local DB)

1. **Clone and install**
   - From the repo root: `npm install`

2. **Environment**
   - Copy `.env.example` to `.env`
   - Edit `.env` if needed (defaults point to `localhost` for PostgreSQL and Redis)

3. **Database**
   - Ensure PostgreSQL and Redis are running
   - Run migrations:  
     `npm run prisma:migrate -w @matrimony/api`  
     or: `cd apps/api && npx prisma migrate dev`

4. **Run the app**
   - API: `npm run dev:api`
   - Web (in another terminal): `npm run dev:web`
   - Web UI: typically `http://localhost:3000`
   - API: typically `http://localhost:3001`

## Optional: full stack with Docker

From the repo root:

```bash
docker-compose up --build
```

This starts PostgreSQL, Redis, MinIO, the API, and the web app. Default ports:

- Web: 3000
- API: 3001
- PostgreSQL: 5433
- Redis: 6379
- MinIO: 9000

Ensure `.env` (or env passed to Compose) has the correct `DATABASE_URL`, `REDIS_URL`, and S3/MinIO settings for the Docker network (see `.env.example` and `docker-compose.yml`).

## Main npm scripts (repo root)

| Script | Description |
|--------|-------------|
| `npm run dev:api` | Start NestJS API in dev mode |
| `npm run dev:web` | Start Next.js web in dev mode |
| `npm run build` | Build shared, API, and web |
| `npm run build:api` | Build shared and API |
| `npm run build:web` | Build shared and web |

## Where to go next

- **Architecture**: See [Architecture](architecture.md) for tech stack and repo layout.
- **Stories / modules**: See the [modules](modules/) pages for per-feature acceptance criteria and API notes.
- **Runbooks**: See [Runbooks](runbooks.md) for deploy, migrations, and troubleshooting.
