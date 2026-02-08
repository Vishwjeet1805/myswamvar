# Jira Setup Tips – Matrimony Project

How to configure Jira for this project so development and tracking stay aligned with the repo.

## Project setup

- Create **one project** (e.g. **MAT** or **MATRIMONY**) with Scrum or Kanban.
- Enable issue types: **Epic**, **Story**, **Task**, **Sub-task**, **Bug**.

## Epic and stories

- Create one **Epic**: “Matrimony Platform – Web & API” (copy summary and acceptance criteria from [../EPIC-MATRIMONY.md](../EPIC-MATRIMONY.md)).
- Create **8 Stories** (01–08) from [../stories/](../stories/):
  - Link each Story to the Epic.
  - Use the story titles and acceptance criteria from the markdown files.
  - Optionally paste technical notes into the Story description or into linked Confluence pages.

## Linking to the repo

- Use the **project key** in branch names (e.g. `MAT-123-feature-name`) so Jira shows branches under Development.
- Mention Jira issue keys in commit messages (e.g. `MAT-123 Add login validation`) for automatic linking.
- If you use [confluence-docs/](../../confluence-docs/) in the repo root, link that Confluence space to the Jira project so docs and issues stay connected.

## Labels and structure

- **Labels** (aligned with story modules): `registration`, `profile`, `search`, `horoscope`, `chat`, `premium`, `admin`, `docs`.
- **Components** (optional, aligned with repo): `web`, `api`, `shared` (for `apps/web`, `apps/api`, `packages/shared`).

Apply labels/components when creating or editing issues so you can filter by module or area later.
