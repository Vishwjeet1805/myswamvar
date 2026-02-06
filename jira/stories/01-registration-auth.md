# Story 01: Registration & Authentication

## Description

Users can sign up (email/phone), log in, and receive JWT-based access. Roles: user, admin. Optional: password reset, email verification.

## Acceptance Criteria

- [x] User can register with email (and optionally phone); password stored hashed (bcrypt/argon2).
- [x] User can log in and receive access token + refresh token (JWT).
- [x] Role-based access: `user` and `admin`; admin routes protected by admin guard.
- [ ] Password reset flow (e.g. email link or OTP) – optional for MVP.
- [ ] Email verification – optional for MVP.
- [x] Invalid credentials and expired tokens return clear, safe error messages.

## Technical Notes

- **API**: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`; optional `POST /auth/forgot-password`, `POST /auth/reset-password`.
- **DB**: `User` table: id, email, phone (nullable), passwordHash, role (enum: user, admin), emailVerified (optional), createdAt, updatedAt.
- **Security**: Rate limit login/register; no secrets in responses; short-lived access token, longer-lived refresh token with rotation.
