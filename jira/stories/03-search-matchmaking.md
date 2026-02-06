# Story 03: Search & Matchmaking

## Description

Users can search profiles with filters (age, location, education, etc.), pagination, and saved searches. Shortlist and "interest" actions for matchmaking.

## Acceptance Criteria

- [ ] Search with filters: age range, location, education, occupation, religion, etc.; results paginated.
- [ ] User can shortlist profiles (save for later).
- [ ] User can send "interest" to a profile; recipient can accept or decline.
- [ ] Mutual interest (both sent interest or one sent and other accepted) enables chat (see Story 05).
- [ ] Saved searches: user can save filter set and optionally get notifications for new matches.
- [ ] Advanced filters (e.g. horoscope, income) available to premium users (Story 06).

## Technical Notes

- **API**: `GET /profiles/search?ageMin=&ageMax=&location=&...&page=&limit=`, `POST /shortlist`, `GET /shortlist`, `POST /interest`, `GET /interest/sent`, `GET /interest/received`, `POST /interest/:id/accept`, `POST /interest/:id/decline`; saved searches: `POST/GET/DELETE /saved-searches`.
- **DB**: `Shortlist` (userId, profileId), `Interest` (fromUserId, toUserId, status: pending|accepted|declined, createdAt); `SavedSearch` (userId, filters JSON, name, notify).
- **Indexes**: Search filters on Profile (age, location, education, etc.) for performance.
