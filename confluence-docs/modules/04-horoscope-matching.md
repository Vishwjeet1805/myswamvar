# Module 04: Horoscope Matching

**Jira story**: `JIRA-XXX` (replace with your story key)

## Description

Store DOB, time, and place of birth. Compute and display match percentage and dosha result (backend logic or integrated astrology API).

## Acceptance criteria

- Profile can store birth details: date of birth, time of birth, place of birth.
- When viewing another profile (or in search), user sees horoscope match percentage and dosha result for the pair.
- Match logic is consistent and testable (implement in backend or integrate reputed API).
- Birth details are optional; match shown only when both profiles have birth data.
- Privacy: birth details can be hidden from public; only match result shown if allowed.

## Main API endpoints

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/profiles/me` | Update profile (including birth fields) |
| GET | `/horoscope/match?profileId=:id` or `GET /profiles/:id/horoscope-match` | Returns match %, dosha summary for current user vs profile |

## Technical notes

- **DB**: Profile fields: dateOfBirth, timeOfBirth (optional), placeOfBirth (optional), birthLatLong (optional). Consider cached `HoroscopeMatch` (userA, userB, matchPercent, doshaResult) for performance.
- **Logic**: Implement nakshatra/rasi compatibility and dosha calculation in backend, or call external API; keep API key in env.

---

**Jira**: Add a **Jira Issue** widget for this story or **Jira Issues (Filter)** for sub-tasks (e.g. `labels = horoscope-matching`).
