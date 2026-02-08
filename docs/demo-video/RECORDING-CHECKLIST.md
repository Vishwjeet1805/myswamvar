# Demo Video – Recording Checklist

Use this checklist before and during recording so the demo looks professional.

## Before You Record

- [ ] **Resolution** – Record at 1920×1080 or 1280×720. Keep aspect ratio consistent for the whole video.
- [ ] **Browser** – Use a clean window: close extra tabs, or use incognito for a fresh session. Set zoom to 100%.
- [ ] **Data** – Run the database seed so the app has profiles and demo data:
  - From repo root: `npm run db:seed` (or `cd apps/api && npx prisma db seed`).
  - This creates 500 seed profiles, a super admin, and (if demo user is seeded) a demo user with shortlist, interests, and chat.
- [ ] **Accounts**
  - **Normal user (demo):** Use the demo user from seed (see [Demo user credentials](#demo-user-credentials) below) or your own account.
  - **Admin:** Use super admin (e.g. `admin@myswayamvar.local` / `SuperAdmin123!` or values from `.env`).
  - **Optional:** A second user for showing mutual interest and chat – the seed can create a demo user with one mutual connection and messages.
- [ ] **TTS** – Choose one voice and speed (~140–160 WPM). Generate audio from [SCRIPT.txt](./SCRIPT.txt); add 1–2 seconds of silence between blocks for easier editing.

## Recording Order

| Order | Route | Purpose |
|-------|--------|--------|
| 1 | `/` | Landing (logged out) |
| 2 | `/register` | Sign up flow |
| 3 | `/login` | Login |
| 4 | `/` | Home dashboard (logged in) |
| 5 | `/search` | Search and filters |
| 6 | `/profile/[id]` | View a profile (from search) |
| 7 | `/shortlist` | Shortlist |
| 8 | `/interests` | Interests sent/received |
| 9 | `/chat`, `/chat/[userId]` | Messages and one chat |
| 10 | `/saved-searches` | Saved searches |
| 11 | `/profile` | My profile (view + edit) |
| 12 | `/subscription` | Premium plans |
| 13 | `/admin` | Admin dashboard (as admin) |
| 14 | `/admin/users`, `/admin/profiles`, `/admin/subscriptions` | Admin sub-pages |
| 15 | `/` | Closing shot |

## Editing Tips

- **Pacing** – Leave 1–2 seconds of silence between narration blocks so cuts are clean.
- **Consistency** – Use one TTS voice and one speed for the whole demo.
- **Captions** – Optionally generate captions from the same script and overlay them.
- **Cuts** – Record in segments (e.g. Part 1: Auth, Part 2: User journey, Part 3: Admin) and cut out long loading or form-filling; keep narration and screen in sync.

## Demo user credentials

The seed creates a **demo user** with shortlist, mutual interest, chat messages, and a saved search so those screens are not empty. Default credentials (overridable via `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD` in `.env`):

- **Email:** `demo@myswayamvar.local`
- **Password:** `DemoUser123!`

Use this account for the user-journey screens (Search, Shortlist, Interests, Chat, Saved searches, My profile, Subscription). For the admin section, log out and use the super admin account (e.g. `admin@myswayamvar.local` / `SuperAdmin123!`).
