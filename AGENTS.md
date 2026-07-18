# advanced-cloud-course — Agent Context

**Read first:** `../../../AGENTS.md` — Manav's workspace brain (identity, rules, preferences). This project inherits all workspace rules.

## What this project is

Course dashboard + website for Manav's self-paced Advanced Cloud Computing course (rebuilt from CSYE 7125). A local-first Next.js app that renders the 13 week modules from `workspace-docs/courses/advanced-cloud-computing/`, tracks per-week checklist progress and definition-of-done, and logs study sessions for streak/consistency tracking. Progress data is JSON committed to this repo so it git-syncs between the Mac and the Hermes VM.

## Conventions

- Design docs → `docs/specs/YYYY-MM-DD-<topic>-design.md`
- Implementation plans → `docs/plans/YYYY-MM-DD-<topic>.md`
- Current status lives in the workspace dashboard: `../../../context/projects.md`
