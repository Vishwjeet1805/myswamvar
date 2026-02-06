# Story 07: Admin Panel

## Description

Admin-only panel for user approval, profile verification, and subscription management. All actions behind admin role.

## Acceptance Criteria

- [ ] Only users with role `admin` can access admin routes and UI.
- [ ] User approval: list pending registrations (if approval workflow exists); approve/reject users.
- [ ] Profile verification: list profiles; mark as verified/rejected; optional notes.
- [ ] Subscription management: list active subscriptions, plan, user; view/cancel if needed (or link to Stripe dashboard).
- [ ] Basic analytics (optional): total users, profiles, active subscriptions, signups over time.
- [ ] Admin actions are logged (who did what, when) for audit.

## Technical Notes

- **API**: All under `/admin` prefix with admin guard. `GET /admin/users` (with status filter), `POST /admin/users/:id/approve`, `POST /admin/users/:id/reject`; `GET /admin/profiles`, `PATCH /admin/profiles/:id/verify`; `GET /admin/subscriptions`; optional `GET /admin/analytics`.
- **DB**: User approval: `status` on User (pending, approved, rejected). Profile: `verifiedAt`, `verifiedBy`, `verificationNotes`. Admin audit log table optional: `AdminAuditLog` (adminId, action, resourceType, resourceId, payload, createdAt).
- **UI**: Admin app or section at `/admin` in Next.js; reuse auth with role check; tables and actions for users, profiles, subscriptions.
