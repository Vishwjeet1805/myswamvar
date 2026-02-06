# Story 05: Chat System

## Description

One-to-one text chat enabled only after mutual interest. Message history stored in DB. Free users have a daily/monthly message limit; premium users unlimited (Story 06).

## Acceptance Criteria

- [ ] Chat is available only when both users have mutual interest (shortlist/interest accepted).
- [ ] One-to-one text messages; real-time delivery (WebSocket or equivalent).
- [ ] Message history persisted and loaded on conversation open.
- [ ] Free users: message limit (e.g. N messages per day) enforced in API and reflected in UI (e.g. "X messages left today").
- [ ] Premium users: unlimited messages (Story 06).
- [ ] No PII or secrets in chat logs; safe for support/audit.

## Technical Notes

- **API**: REST for history: `GET /chat/conversations`, `GET /chat/conversations/:userId/messages?before=&limit=`, `POST /chat/conversations/:userId/messages` (optional, or send only via WebSocket). WebSocket: connect with JWT; events: `message`, `typing`; server validates mutual interest and message limit before persisting.
- **DB**: `Conversation` (user1Id, user2Id, createdAt); `Message` (conversationId or (senderId, receiverId), content, createdAt). Count messages per user per day for limit.
- **Redis**: Optional – presence (online/offline), rate limit for free-tier message count.
