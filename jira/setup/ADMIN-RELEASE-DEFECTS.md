# Jira Admin: Release 1.0 and Defect Tracking

Tips for your Jira admin to manage Release 1.0 and track defects for the Matrimony project.

## Managing Release 1.0

### Version

- Create a version **Release 1.0** (or **v1.0**) in the project.
- Set a release date or leave TBD until the scope is stable.

### Scope

- Assign **Fix version** = Release 1.0 to all Stories and Tasks that must ship in 1.0 (the 8 stories and their breakdown).
- Use a saved filter: `fixVersion = "Release 1.0"` to see the release backlog.
- Use a board or backlog view filtered by this version so the team only sees 1.0 work.

### Release checklist

Before closing Release 1.0:

- All 1.0 stories (or their child tasks) are in **Done**.
- All bugs marked for 1.0 are either **fixed (Done)** or **deferred** (moved to a later version or backlog).
- Quick sign-off: regression pass and critical flows (registration, login, profile, search, chat, premium, admin) verified.

---

## Tracking defects

### Bug workflow

- Use states such as: **Open** → **In Progress** → **In Review** → **Done** (and optionally **Rejected** / **Deferred**).
- Require **Fix version** (or **Target version**) on bugs so you know which release they belong to.

### Severity / priority

- Use **Priority** (e.g. Highest / High / Medium / Low) for ordering.
- Optionally add a custom **Severity** field (Critical / Major / Minor / Trivial) so the admin can triage and sort the backlog consistently.

### Linking to scope

- **Link bugs to the Story** (or Epic) they relate to (e.g. “Login fails” → Story 01). This keeps traceability and helps decide whether a bug blocks 1.0.

### Triage

- **Critical / Blocker** → must fix in 1.0 or slip the release.
- **Major** → fix in 1.0 if time allows.
- **Minor / Trivial** → backlog or next release.
- Use a **“Defects”** or **“Bugs”** quick filter on the board.
- Consider a dedicated filter: **“Bugs for Release 1.0”** (e.g. `type = Bug AND fixVersion = "Release 1.0" AND status != Done`).

### Visibility

- **Dashboard**: add a gadget for **Release 1.0** (version report or filter results).
- Add a gadget for **Open bugs** (and optionally **Open bugs for Release 1.0**).
