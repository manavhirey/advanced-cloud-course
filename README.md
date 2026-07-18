# advanced-cloud-course

Local-first dashboard + website for the self-paced Advanced Cloud Computing course
(content source: `../../../workspace-docs/courses/advanced-cloud-computing/`).

## Usage

```bash
npm install
npm run ingest   # re-run whenever the course docs change
npm run dev      # http://localhost:3000
npm test
```

Progress (`data/progress.json`) and study sessions (`data/sessions.json`) are plain
JSON committed to this repo — commit and push to sync between machines.

Design: `docs/specs/2026-07-17-course-dashboard-design.md`.
Plan: `docs/plans/2026-07-17-course-dashboard.md`.
