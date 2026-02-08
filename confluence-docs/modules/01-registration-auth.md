# Module 01: Registration & Authentication

**Jira story**: `JIRA-XXX` (replace with your story key)

## Description

Users can sign up (email/phone), log in, and receive JWT-based access. Roles: user, admin. Optional: password reset, email verification.

## Acceptance criteria

- User can register with email (and optionally phone); password stored hashed (bcrypt/argon2).
- User can log in and receive access token + refresh token (JWT).
- Role-based access: `user` and `admin`; admin routes protected by admin guard.
- Password reset flow (e.g. email link or OTP) – optional for MVP.
- Email verification – optional for MVP.
- Invalid credentials and expired tokens return clear, safe error messages.

## Main API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register with email (and optionally phone) |
| POST | `/auth/login` | Log in; returns access + refresh tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Log out (invalidate refresh if applicable) |
| POST | `/auth/forgot-password` | Optional: initiate password reset |
| POST | `/auth/reset-password` | Optional: complete password reset |

## Technical notes

- **DB**: `User` table: id, email, phone (nullable), passwordHash, role (enum: user, admin), emailVerified (optional), createdAt, updatedAt.
- **Security**: Rate limit login/register; no secrets in responses; short-lived access token, longer-lived refresh token with rotation.

---

**Jira**: Add a **Jira Issue** widget for this story (e.g. `JIRA-XXX`) or **Jira Issues (Filter)** for sub-tasks (e.g. `parent = JIRA-XXX` or `labels = registration-auth`).
