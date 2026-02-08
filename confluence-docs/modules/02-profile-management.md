# Module 02: Profile Management

**Jira story**: `JIRA-XXX` (replace with your story key)

## Description

Users can create, read, and update their profile (bio, photos, preferences). Verification flags and privacy settings are supported.

## Acceptance criteria

- User can create/update profile: bio, basic info (name, DOB, gender, location), education, occupation, preferences.
- User can upload and manage profile photos (primary + gallery); file type/size limits enforced.
- Profile has verification flags (e.g. email verified, profile verified by admin).
- Privacy settings: what is visible to whom (e.g. contact visible to premium only).
- Other users see profile according to visibility rules; own profile always fully editable.

## Main API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/profiles/me` | Get current user’s profile |
| POST | `/profiles/me` | Create own profile |
| PATCH | `/profiles/me` | Update own profile |
| GET | `/profiles/:id` | Get another user’s profile (with visibility rules) |
| POST | `/profiles/me/photos` | Upload profile photo |
| DELETE | `/profiles/me/photos/:id` | Delete profile photo |

## Technical notes

- **DB**: `Profile` table linked to User; fields for bio, DOB, gender, location, education, occupation, preferences (JSON or separate columns); `ProfilePhoto` table; verification flags on User or Profile.
- **Storage**: Profile photos in S3/MinIO; store URLs in DB.

---

**Jira**: Add a **Jira Issue** widget for this story or **Jira Issues (Filter)** for sub-tasks (e.g. `labels = profile-management`).
