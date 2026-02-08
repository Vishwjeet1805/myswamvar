# Module 03: Search & Matchmaking

**Jira story**: `JIRA-XXX` (replace with your story key)

## Description

Users can search profiles with filters (age, location, education, etc.), pagination, and saved searches. Shortlist and “interest” actions for matchmaking.

## Acceptance criteria

- Search with filters: age range, location, education, occupation, religion, etc.; results paginated.
- User can shortlist profiles (save for later).
- User can send “interest” to a profile; recipient can accept or decline.
- Mutual interest (both sent interest or one sent and other accepted) enables chat (see Module 05).
- Saved searches: user can save filter set and optionally get notifications for new matches.
- Advanced filters (e.g. horoscope, income) available to premium users (Module 06).

## Main API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/profiles/search` | Search with query params: ageMin, ageMax, location, etc.; page, limit |
| POST | `/shortlist` | Add profile to shortlist |
| GET | `/shortlist` | Get current user’s shortlist |
| POST | `/interest` | Send interest to a profile |
| GET | `/interest/sent` | List sent interests |
| GET | `/interest/received` | List received interests |
| POST | `/interest/:id/accept` | Accept an interest |
| POST | `/interest/:id/decline` | Decline an interest |
| POST | `/saved-searches` | Create saved search |
| GET | `/saved-searches` | List saved searches |
| DELETE | `/saved-searches/:id` | Delete saved search |

## Technical notes

- **DB**: `Shortlist` (userId, profileId), `Interest` (fromUserId, toUserId, status: pending\|accepted\|declined, createdAt); `SavedSearch` (userId, filters JSON, name, notify).
- **Indexes**: Search filters on Profile (age, location, education, etc.) for performance.

---

**Jira**: Add a **Jira Issue** widget for this story or **Jira Issues (Filter)** for sub-tasks (e.g. `labels = search-matchmaking`).
