# Build stage (Debian for Prisma engine compatibility; Alpine lacks libssl.so.1.1)
FROM node:20-bookworm-slim AS builder

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN npm install

COPY packages/shared packages/shared
COPY apps/api apps/api

RUN npm run build -w @matrimony/shared
# Build API: use WORKDIR so nest build outputs to ./dist under apps/api
WORKDIR /app/apps/api
RUN npx prisma generate && npx nest build && npx tsc -p prisma/tsconfig.json
# Copy dist to a known path. Nest builds to /app/apps/api/dist when WORKDIR is /app/apps/api.
WORKDIR /app
RUN if [ -f /app/apps/api/dist/main.js ]; then \
  mkdir -p /app/api-dist && cp -r /app/apps/api/dist/* /app/api-dist/; \
else \
  echo "main.js not found at /app/apps/api/dist. Listing /app/apps/api/dist:" && \
  find /app/apps/api -maxdepth 3 -type f -name 'main.js' 2>/dev/null | head -20 && \
  exit 1; \
fi

# Production stage (Debian to match Prisma engine from builder)
FROM node:20-bookworm-slim AS runner

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/api-dist ./apps/api/dist

RUN npm install --omit=dev
# Prisma generate ran in builder; copy generated client so @prisma/client works at runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001

# Run migrations then start the API (DATABASE_URL must be set)
CMD ["sh", "-c", "cd /app/apps/api && npx prisma migrate deploy && exec node /app/apps/api/dist/main.js"]
