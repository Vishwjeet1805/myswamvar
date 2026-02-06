# Story 02: Profile Management

## Description

Users can create, read, update profile (bio, photos, preferences). Verification flags and privacy settings supported.

## Acceptance Criteria

- [ ] User can create/update profile: bio, basic info (name, DOB, gender, location), education, occupation, preferences.
- [ ] User can upload and manage profile photos (primary + gallery); file type/size limits enforced.
- [ ] Profile has verification flags (e.g. email verified, profile verified by admin).
- [ ] Privacy settings: what is visible to whom (e.g. contact visible to premium only).
- [ ] Other users see profile according to visibility rules; own profile always fully editable.

## Technical Notes

- **API**: `GET/POST/PATCH /profiles/me`, `GET /profiles/:id` (with visibility rules); `POST /profiles/me/photos`, `DELETE /profiles/me/photos/:id`.
- **DB**: `Profile` table linked to User; fields for bio, DOB, gender, location, education, occupation, preferences (JSON or separate columns); `ProfilePhoto` table; verification flags on User or Profile.
- **Storage**: Profile photos in S3/MinIO; store URLs in DB.
