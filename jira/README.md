# Jira – Matrimony Project

This folder holds the **epic** and **user stories** for the matrimony platform. Use it to implement side by side with development.

## Contents

- **EPIC-MATRIMONY.md** – Epic: "Matrimony Platform – Web & API" with summary and high-level acceptance criteria.
- **stories/** – One markdown file per FRD module (01–08) with title, description, acceptance criteria, and optional technical notes.

## How to Use

- **Option A**: Copy or sync these stories into your Jira/Linear/Notion and track progress there.
- **Option B**: Track progress in the markdown files (e.g. add `[x]` to acceptance criteria as you complete them).
- Implement in story order (01 → 08) for a logical dependency flow.

## Local setup (after implementing stories)

From repo root: `npm install`, copy `.env.example` to `.env`, ensure PostgreSQL and Redis are running. For the API: `npm run prisma:migrate -w @matrimony/api` (or `cd apps/api && npx prisma migrate dev`), then `npm run dev:api` and `npm run dev:web`.

## Story Order

1. 01-registration-auth
2. 02-profile-management
3. 03-search-matchmaking
4. 04-horoscope-matching
5. 05-chat-system
6. 06-premium-membership
7. 07-admin-panel
8. 08-swagger-documentation
