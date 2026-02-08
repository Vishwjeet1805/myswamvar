# Module 07: Admin Panel

**Jira story**: `JIRA-XXX` (replace with your story key)

## Description

Admin-only panel for user approval, profile verification, and subscription management. All actions behind admin role.

## Acceptance criteria

- Only users with role `admin` can access admin routes and UI.
- User approval: list pending registrations (if approval workflow exists); approve/reject users.
- Profile verification: list profiles; mark as verified/rejected; optional notes.
- Subscription management: list active subscriptions, plan, user; view/cancel if needed (or link to Stripe dashboard).
- Basic analytics (optional): total users, profiles, active subscriptions, signups over time.
- Admin actions are logged (who did what, when) for audit.

## Main API endpoints (all under `/admin`, admin guard required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | List users (with status filter) |
| POST | `/admin/users/:id/approve` | Approve user |
| POST | `/admin/users/:id/reject` | Reject user |
| GET | `/admin/profiles` | List profiles |
| PATCH | `/admin/profiles/:id/verify` | Set profile verification (and optional notes) |
| GET | `/admin/subscriptions` | List subscriptions |
| GET | `/admin/analytics` | Optional: basic analytics |

## Technical notes

- **DB**: User approval: `status` on User (pending, approved, rejected). Profile: `verifiedAt`, `verifiedBy`, `verificationNotes`. Optional: `AdminAuditLog` (adminId, action, resourceType, resourceId, payload, createdAt).
- **UI**: Admin section at `/admin` in Next.js; reuse auth with role check; tables and actions for users, profiles, subscriptions.

---

**Jira**: Add a **Jira Issue** widget for this story or **Jira Issues (Filter)** for sub-tasks (e.g. `labels = admin-panel`).
