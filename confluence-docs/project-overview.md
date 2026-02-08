# My Swayamvar – Project overview

## Product

**My Swayamvar** is a web-based matrimonial platform with role-based access: a rich frontend (Next.js), scalable backend (NestJS), PostgreSQL and Redis, and Docker deployment. It covers registration, profiles, search, horoscope matching, chat (after mutual interest), premium membership, and an admin panel.

## Epic summary

- **Epic**: Matrimony Platform – Web & API
- **Scope**: Registration and authentication; profile management; search and matchmaking; horoscope matching; one-to-one chat (post mutual interest); premium membership with plans and payment; admin panel for user approval, profile verification, and subscription management; application runs in Docker (Compose: API, web, PostgreSQL, Redis, optional MinIO/Nginx).

## High-level acceptance criteria

- Users can register, log in, and manage profiles with photos and preferences.
- Search and matchmaking support filters (age, location, education, etc.) and shortlist/interest actions.
- Horoscope matching: DOB, time, place of birth; match percentage and dosha result.
- Chat is enabled only after mutual interest; one-to-one text; message limits for free users.
- Premium membership: plans (e.g. monthly/yearly), payment integration; unlimited chat, contact access, advanced filters.
- Admin panel: user approval, profile verification, subscription management; all behind admin role.
- Application runs in Docker (Compose: API, web, PostgreSQL, Redis, optional MinIO/Nginx).

## Child stories (modules)

| # | Story |
|---|--------|
| 1 | Registration & Authentication |
| 2 | Profile Management |
| 3 | Search & Matchmaking |
| 4 | Horoscope Matching |
| 5 | Chat System |
| 6 | Premium Membership |
| 7 | Admin Panel |
| 8 | Swagger / OpenAPI Documentation |

See the **Stories / Modules** pages for detailed acceptance criteria and API notes per module.

---

**Jira**: Add a **Jira Issues (Filter)** or **Jira Roadmap** widget here with filter `parent = <your-epic-key>` so the epic’s child issues are visible. Optionally add a **Jira Chart** (e.g. issues by status or assignee).
