# Epic: Matrimony Platform – Web & API

## Summary

Web-based matrimonial system with role-based access: rich frontend (Next.js), scalable backend (NestJS), PostgreSQL + Redis, Docker deployment. Covers registration, profiles, search, horoscope matching, chat (after mutual interest), premium membership, and admin panel.

## High-Level Acceptance Criteria

- [ ] Users can register, log in, and manage profiles with photos and preferences.
- [ ] Search and matchmaking support filters (age, location, education, etc.) and shortlist/interest actions.
- [ ] Horoscope matching: DOB, time, place of birth; match percentage and dosha result.
- [ ] Chat is enabled only after mutual interest; one-to-one text; message limits for free users.
- [ ] Premium membership: plans (e.g. monthly/yearly), payment integration; unlimited chat, contact access, advanced filters.
- [ ] Admin panel: user approval, profile verification, subscription management; all behind admin role.
- [ ] Application runs in Docker (Compose: API, web, PostgreSQL, Redis, optional MinIO/Nginx).

## Child Stories

| # | Story | File |
|---|--------|------|
| 1 | Registration & Authentication | [01-registration-auth.md](stories/01-registration-auth.md) |
| 2 | Profile Management | [02-profile-management.md](stories/02-profile-management.md) |
| 3 | Search & Matchmaking | [03-search-matchmaking.md](stories/03-search-matchmaking.md) |
| 4 | Horoscope Matching | [04-horoscope-matching.md](stories/04-horoscope-matching.md) |
| 5 | Chat System | [05-chat-system.md](stories/05-chat-system.md) |
| 6 | Premium Membership | [06-premium-membership.md](stories/06-premium-membership.md) |
| 7 | Admin Panel | [07-admin-panel.md](stories/07-admin-panel.md) |
| 8 | Swagger / OpenAPI Documentation | [08-swagger-documentation.md](stories/08-swagger-documentation.md) |
