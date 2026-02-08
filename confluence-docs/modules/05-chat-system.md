# Module 05: Chat System

**Jira story**: `JIRA-XXX` (replace with your story key)

## Description

One-to-one text chat enabled only after mutual interest. Message history stored in DB. Free users have a daily/monthly message limit; premium users unlimited (Module 06).

## Acceptance criteria

- Chat is available only when both users have mutual interest (shortlist/interest accepted).
- One-to-one text messages; real-time delivery (WebSocket or equivalent).
- Message history persisted and loaded on conversation open.
- Free users: message limit (e.g. N messages per day) enforced in API and reflected in UI (e.g. “X messages left today”).
- Premium users: unlimited messages (Module 06).
- No PII or secrets in chat logs; safe for support/audit.

## Main API endpoints and WebSocket

**REST (history)**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/chat/conversations` | List conversations |
| GET | `/chat/conversations/:userId/messages` | Get messages (query: before, limit) |
| POST | `/chat/conversations/:userId/messages` | Send message (optional; or send only via WebSocket) |

**WebSocket**: Connect with JWT; events: `message`, `typing`; server validates mutual interest and message limit before persisting.

## Technical notes

- **DB**: `Conversation` (user1Id, user2Id, createdAt); `Message` (conversationId or senderId/receiverId, content, createdAt). Count messages per user per day for limit.
- **Redis**: Optional – presence (online/offline), rate limit for free-tier message count.

---

**Jira**: Add a **Jira Issue** widget for this story or **Jira Issues (Filter)** for sub-tasks (e.g. `labels = chat-system`).
