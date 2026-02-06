# Story 04: Horoscope Matching

## Description

Store DOB, time, and place of birth. Compute and display match percentage and dosha result (backend logic or integrated astrology API).

## Acceptance Criteria

- [ ] Profile can store birth details: date of birth, time of birth, place of birth.
- [ ] When viewing another profile (or in search), user sees horoscope match percentage and dosha result for the pair.
- [ ] Match logic is consistent and testable (implement in backend or integrate reputed API).
- [ ] Birth details are optional; match shown only when both profiles have birth data.
- [ ] Privacy: birth details can be hidden from public; only match result shown if allowed.

## Technical Notes

- **API**: `PATCH /profiles/me` (birth fields); `GET /horoscope/match?profileId=:id` or `GET /profiles/:id/horoscope-match` (returns match %, dosha summary for current user vs profile).
- **DB**: Profile fields: dateOfBirth, timeOfBirth (optional), placeOfBirth (optional), birthLatLong (optional). Consider cached `HoroscopeMatch` (userA, userB, matchPercent, doshaResult) for performance.
- **Logic**: Implement nakshatra/rasi compatibility and dosha calculation in backend, or call external API; keep API key in env.
