# Confluence documentation – My Swayamvar

This folder contains **Confluence page sources** for the My Swayamvar (matrimony) project. Use these markdown files to copy or import content into your Confluence space so the team has a single place to understand the product, architecture, and modules.

## Contents

| File | Confluence page suggestion |
|------|----------------------------|
| [project-overview.md](project-overview.md) | My Swayamvar – Project overview |
| [architecture.md](architecture.md) | Architecture |
| [getting-started.md](getting-started.md) | Getting started |
| [runbooks.md](runbooks.md) | Runbooks |
| [modules/](modules/) | Stories / Modules (one page per story, or one parent with children) |

## How to use

- **Option A**: In Confluence, use **Import** (e.g. from Markdown) if your instance supports it, and import these files as pages.
- **Option B**: Create pages in Confluence and copy-paste the markdown content; Confluence will render most markdown with minimal edits.
- Keep this folder in sync with the repo: when you update [jira/](../jira/) stories or architecture, update the corresponding file here so Confluence can be refreshed.

## Jira widgets

Jira widget suggestions are documented here and in each module page. Add them **manually** in Confluence:

1. Open the Confluence page and click **Insert** (or **+**).
2. Search for **Jira** and choose **Jira Issue(s)**, **Jira Filter**, **Jira Board**, **Jira Chart**, or **Jira Roadmap**.
3. Select your Jira site and project, then set the filter (e.g. by epic key, label, or single issue key).
4. Save; the widget will render live in Confluence.

**Suggested placements:**

- **Project overview**: Jira Issues (Filter) or Jira Roadmap for the epic’s child issues; Jira Chart (issues by status/assignee).
- **Each module page**: Jira Issue (single issue) linking the story for that module, or Jira Issues (Filter) for that story’s sub-tasks.
- **Sprint / Backlog page**: Jira Board, Jira Backlog, or Jira Sprint widget.

Replace placeholder issue keys (e.g. `JIRA-XXX`) in module pages with your real Jira story keys once created.
