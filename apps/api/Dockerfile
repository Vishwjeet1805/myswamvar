# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN npm install

COPY packages/shared packages/shared
COPY apps/api apps/api

RUN npm run build -w @matrimony/shared
RUN npm run build -w @matrimony/api

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist

RUN npm install --omit=dev

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]
