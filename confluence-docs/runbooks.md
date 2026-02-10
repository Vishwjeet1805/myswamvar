# Runbooks

Operational notes for running, deploying, and troubleshooting the My Swayamvar application.

## Docker build and run

From the repo root:

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Default ports: Web 3000, API 3001, PostgreSQL 5433, Redis 6379, MinIO 9000. Override with env vars (see `.env.example` and `docker-compose.yml`).

## Database migrations

- **Local / dev**: From repo root:  
  `npm run prisma:migrate -w @matrimony/api`  
  or: `cd apps/api && npx prisma migrate dev`
- **Production**: Run migrations as part of deploy (e.g. in CI or a one-off job):  
  `npx prisma migrate deploy` from `apps/api` with production `DATABASE_URL`.

## Environment variables

Copy `.env.example` to `.env` and set values. Key variables:

- **Database**: `DATABASE_URL`, `POSTGRES_*`
- **Redis**: `REDIS_URL`
- **API**: `PORT`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- **Web**: `NEXT_PUBLIC_API_URL`, `WEB_BASE_URL`
- **Swagger**: `SWAGGER_ENABLED` (set to `false` to disable in production)
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (for premium)
- **S3/MinIO**: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, etc.

Never commit secrets; use env vars or a secrets manager in production.

## Common issues

- **API won’t start**: Ensure PostgreSQL and Redis are reachable; check `DATABASE_URL` and `REDIS_URL`. Run migrations if schema is out of date.
- **Web can’t reach API**: Verify `NEXT_PUBLIC_API_URL` (browser uses this; must be reachable from the client).
- **Photo upload fails**: Check MinIO/S3 env vars and bucket existence; ensure API has network access to the S3 endpoint.
- **401 on protected routes**: Check JWT secrets and token expiry; ensure refresh flow is used when access token expires.

---

**Jira**: Optionally add **Jira Issues** filtered by label (e.g. `runbook`, `ops`) if you track operational work in Jira.
