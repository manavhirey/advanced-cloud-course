# Course Dashboard & Website — Design

**Date:** 2026-07-17 · **Status:** approved by Manav (conversation, 2026-07-17)

## Purpose

A local-first website + dashboard for Manav's self-paced Advanced Cloud Computing course (`workspace-docs/courses/advanced-cloud-computing/` in the workspace repo). It must let him (1) follow the 13 week modules as browsable pages, (2) check off each week's Build checklist and definition-of-done, and (3) log study sessions to track streaks and consistency. Out of scope for v1: per-week notes/journal, deployment/hosting, auth, multi-course support.

## Architecture

One Next.js app (App Router, TypeScript, Tailwind), run locally with `npm run dev`. No database and no external services: Next.js API route handlers read and write JSON files under `data/`. Those files are committed to this repo, so progress syncs between the Mac and the Hermes VM through the normal git push/pull ritual. The app never runs git itself.

```
workspace-docs/courses/advanced-cloud-computing/   (source of truth, workspace repo)
        │  npm run ingest (manual, on content change)
        ▼
content/*.md  +  data/manifest.json                (committed, this repo)
        ▼ read
Next.js app ── API routes ──▶ data/progress.json, data/sessions.json (committed)
```

## Components

### 1. Ingest script (`scripts/ingest.ts`, run as `npm run ingest`)

- Reads the course README, the 13 `weeks/*.md` files, and `reference/worked-repos.md` from the workspace course directory (path configurable, default relative `../../../workspace-docs/courses/advanced-cloud-computing`).
- Copies them into `content/` verbatim.
- Emits `data/manifest.json`: ordered weeks (`id` like `week-06`, title, theme, source filename) and, per week, every markdown task-list item (`- [ ]`) found anywhere in the file, each with a **stable item ID**: `weekId:index:hash8(normalized text)`.
- **ID stability rule:** on re-ingest, an item whose normalized text is unchanged keeps its ID even if it moved position (match by hash within the week; ties broken by order). Items that disappear are reported to stdout as orphans along with any progress entries that reference them; the script never deletes progress entries.
- Definition-of-done sections are captured per week as a single prose blob (rendered on the week page next to a manual per-week "done" toggle — they are not itemized checkboxes).

### 2. Data files (`data/`)

- `manifest.json` — generated only by ingest; the app treats it as read-only.
- `progress.json` — `{ items: { [itemId]: { done: true, at: ISO8601 } }, weeks: { [weekId]: { dodDone: true, at } } }`. Unchecking deletes the key (no tombstones).
- `sessions.json` — `{ sessions: [ { date: "YYYY-MM-DD", minutes: number, weekId?: string, note?: string } ] }`, append-only via the UI (manual edits allowed — it's just JSON).
- All writes are atomic: write to `<file>.tmp`, then rename. Dates are local-time calendar dates (no UTC conversion) since this is a single-user local app.

### 3. API routes

- `GET /api/state` — manifest + progress + sessions in one payload.
- `POST /api/progress` — `{ itemId | weekId, done }`; validates the ID exists in the manifest; 400 otherwise.
- `POST /api/sessions` — `{ date?, minutes, weekId?, note? }`; date defaults to today; minutes must be a positive integer.

### 4. Pages

- `/` **Dashboard** — overall completion % (checked items / total), 13 per-week status cards (not started / in progress / done — done = all items checked + dodDone), current streak, longest streak, calendar heatmap (course-to-date), and a quick-add session form.
- `/weeks/[id]` **Week page** — the module markdown rendered (headings, links, code), with checklist items rendered as live checkboxes bound to progress; definition-of-done block with its toggle; prev/next week nav.
- `/course` **Course map** — the course README rendered, with week links; also `/reference` for the worked-repos doc.

### 5. Streak & heatmap logic (`lib/streaks.ts`, pure functions)

- A calendar day is **active** if ≥1 session was logged for it or ≥1 progress entry has `at` on that day.
- Current streak counts consecutive active days ending today or yesterday (today not yet active doesn't break it until tomorrow).
- Heatmap intensity buckets by minutes logged that day; active-by-checkbox-only days render at the minimum non-zero intensity.

## Error handling

- API writes: atomic rename; on any failure return 500 with the message, never leave a partial file.
- Missing/corrupt `progress.json` or `sessions.json`: treated as empty with a visible banner ("progress file unreadable — fix or delete data/progress.json"), never silently overwritten on read; the next successful write recreates a valid file.
- Missing manifest/content: the app renders a setup page telling the user to run `npm run ingest`.
- Ingest with the workspace docs path missing: exit non-zero with a clear message; never write a partial manifest.

## Testing

- Unit (Vitest): manifest parsing (checklist extraction, ID generation) and the ID-stability rule across simulated doc edits; streak/heatmap date math including month/year boundaries and the today/yesterday grace rule.
- Integration: API route handlers against a temp `data/` dir (check/uncheck, session add, validation failures, corrupt-file behavior).
- Manual smoke: `npm run ingest && npm run dev`, click through dashboard + one week page.

## Execution model

Implementation is performed by subagents orchestrated per the implementation plan in `docs/plans/` (work packages: app scaffold, ingest script, API + data layer, dashboard UI, week/content pages, tests). The orchestrator reviews each package against this spec before integration.
