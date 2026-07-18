# Course Dashboard & Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A local-first Next.js site that renders the Advanced Cloud Computing course, tracks checklist progress, and logs study sessions with streaks — per `docs/specs/2026-07-17-course-dashboard-design.md`.

**Architecture:** One Next.js App Router app at the repo root. Pure logic lives in `lib/` (parsing, streaks, API logic) and is unit-tested with Vitest; API route files are thin wrappers; pages are server components reading JSON from `data/` directly; small client components handle checkbox/session mutations then `router.refresh()`.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 3 + @tailwindcss/typography, marked 12 (pinned exact), Vitest 3, tsx (script runner).

## Global Constraints

- All JSON writes go through `writeJsonAtomic` (write `<file>.tmp`, then rename). Never write JSON any other way.
- Dates are **local-time** calendar strings `YYYY-MM-DD`. Never use UTC date math.
- The app never runs git.
- `data/` and `content/` locations resolve through `lib/paths.ts` (env overrides `DATA_DIR` / `CONTENT_DIR`) — never hardcode these paths elsewhere.
- Corrupt (unparseable) `progress.json`/`sessions.json`: reads treat as empty + set a corrupt flag; **writes to a corrupt file return 409**, never overwrite it.
- `marked` is pinned exact (`12.0.2`) because checkbox HTML output is string-matched; do not bump it in this plan.
- Item IDs are `weekId:index:hash8(normalizedText)` and must survive re-ingest per the merge rule in Task 3.
- Commit after every task in this project repo with Conventional Commit messages.
- Run all commands from the project root: `/Users/MAC/Documents/ClaudeAgents/MaxBot/workspace-projects/Personal/advanced-cloud-course`.

---

### Task 1: App scaffold + tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `vitest.config.ts`, `.gitignore`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (placeholder), `tests/smoke.test.ts`

**Interfaces:**
- Produces: a running `npm run dev` app and `npm test` harness; path alias `@/*` → repo root; nav shell with links `/`, `/course`, `/reference`.

- [ ] **Step 1: Write config files**

`package.json`:
```json
{
  "name": "advanced-cloud-course",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "ingest": "tsx scripts/ingest.ts",
    "test": "vitest run"
  },
  "dependencies": {
    "marked": "12.0.2",
    "next": "^15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.15",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vitest": "^3.0.0"
  }
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {}
export default nextConfig
```

`postcss.config.mjs`:
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

`tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [typography],
} satisfies Config
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname) } },
})
```

`.gitignore`:
```
node_modules/
.next/
next-env.d.ts
*.tmp
*.log
```

- [ ] **Step 2: Write the app shell**

`app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = { title: 'Advanced Cloud Course' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <nav className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
            <Link href="/" className="font-semibold">☁️ Advanced Cloud Course</Link>
            <Link href="/course" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">Course map</Link>
            <Link href="/reference" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">Reference</Link>
          </div>
        </nav>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
```

`app/page.tsx` (placeholder, replaced in Task 8):
```tsx
export default function Dashboard() {
  return <p>Dashboard coming soon.</p>
}
```

`tests/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 3: Install and verify**

Run: `npm install`
Expected: completes without errors (peer-dep warnings OK).

Run: `npm test`
Expected: 1 test passes.

Run: `npm run build`
Expected: build succeeds (static pages generated).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js app with Tailwind and Vitest"
```

---

### Task 2: Types, paths, atomic JSON layer

**Files:**
- Create: `lib/types.ts`, `lib/paths.ts`, `lib/fsjson.ts`
- Test: `tests/fsjson.test.ts`

**Interfaces:**
- Produces (used by every later task):
  - `lib/types.ts`: `ManifestItem { id: string; weekId: string; index: number; text: string }`, `ManifestWeek { id: string; title: string; file: string; order: number; items: ManifestItem[]; dod: string | null }`, `Manifest { generatedAt: string; weeks: ManifestWeek[]; extras: { file: string; title: string }[] }`, `Progress { items: Record<string, { done: true; at: string }>; weeks: Record<string, { dodDone: true; at: string }> }`, `Session { date: string; minutes: number; weekId?: string; note?: string }`, `Sessions { sessions: Session[] }`
  - `lib/paths.ts`: `dataDir(): string`, `contentDir(): string`, `manifestPath(): string`, `progressPath(): string`, `sessionsPath(): string`
  - `lib/fsjson.ts`: `readJson<T>(file: string): { ok: true; data: T } | { ok: false; error: 'missing' | 'corrupt' }`, `writeJsonAtomic(file: string, data: unknown): void`

- [ ] **Step 1: Write the failing tests**

`tests/fsjson.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { readJson, writeJsonAtomic } from '@/lib/fsjson'

let dir: string
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fsjson-'))
})

describe('readJson', () => {
  it('returns missing for absent file', () => {
    expect(readJson(path.join(dir, 'nope.json'))).toEqual({ ok: false, error: 'missing' })
  })
  it('returns corrupt for invalid JSON', () => {
    const f = path.join(dir, 'bad.json')
    fs.writeFileSync(f, '{ not json')
    expect(readJson(f)).toEqual({ ok: false, error: 'corrupt' })
  })
  it('round-trips through writeJsonAtomic', () => {
    const f = path.join(dir, 'sub', 'ok.json')
    writeJsonAtomic(f, { a: 1 })
    expect(readJson<{ a: number }>(f)).toEqual({ ok: true, data: { a: 1 } })
  })
})

describe('writeJsonAtomic', () => {
  it('leaves no .tmp file behind', () => {
    const f = path.join(dir, 'x.json')
    writeJsonAtomic(f, [1, 2])
    expect(fs.existsSync(f + '.tmp')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/fsjson`.

- [ ] **Step 3: Implement**

`lib/types.ts`:
```ts
export interface ManifestItem {
  id: string
  weekId: string
  index: number
  text: string
}

export interface ManifestWeek {
  id: string
  title: string
  file: string
  order: number
  items: ManifestItem[]
  dod: string | null
}

export interface Manifest {
  generatedAt: string
  weeks: ManifestWeek[]
  extras: { file: string; title: string }[]
}

export interface Progress {
  items: Record<string, { done: true; at: string }>
  weeks: Record<string, { dodDone: true; at: string }>
}

export interface Session {
  date: string
  minutes: number
  weekId?: string
  note?: string
}

export interface Sessions {
  sessions: Session[]
}
```

`lib/paths.ts`:
```ts
import path from 'node:path'

export const dataDir = () => process.env.DATA_DIR ?? path.join(process.cwd(), 'data')
export const contentDir = () => process.env.CONTENT_DIR ?? path.join(process.cwd(), 'content')
export const manifestPath = () => path.join(dataDir(), 'manifest.json')
export const progressPath = () => path.join(dataDir(), 'progress.json')
export const sessionsPath = () => path.join(dataDir(), 'sessions.json')
```

`lib/fsjson.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'

export type ReadResult<T> = { ok: true; data: T } | { ok: false; error: 'missing' | 'corrupt' }

export function readJson<T>(file: string): ReadResult<T> {
  let raw: string
  try {
    raw = fs.readFileSync(file, 'utf8')
  } catch {
    return { ok: false, error: 'missing' }
  }
  try {
    return { ok: true, data: JSON.parse(raw) as T }
  } catch {
    return { ok: false, error: 'corrupt' }
  }
}

export function writeJsonAtomic(file: string, data: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = file + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  fs.renameSync(tmp, file)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/ tests/fsjson.test.ts
git commit -m "feat: add types, path resolution, and atomic JSON file layer"
```

---

### Task 3: Manifest parsing and ID stability

**Files:**
- Create: `lib/manifest.ts`
- Test: `tests/manifest.test.ts`

**Interfaces:**
- Consumes: types from `lib/types.ts`.
- Produces:
  - `normalizeText(t: string): string` — lowercase, collapse whitespace, trim
  - `hash8(t: string): string` — first 8 hex chars of sha256 of normalized text
  - `weekIdFromFile(fileName: string): string` — `week-06-eks.md` → `week-06`; throws on other shapes
  - `parseWeekFile(fileName: string, md: string, order: number): ManifestWeek` — extracts title from first `# ` line, every `- [ ]`/`- [x]` item anywhere in the file (in order), and the `## Definition of done` section body
  - `mergeManifest(prev: Manifest | null, next: Manifest): { manifest: Manifest; orphans: ManifestItem[] }`
  - `orphanedProgressKeys(orphans: ManifestItem[], progress: Progress): string[]`

- [ ] **Step 1: Write the failing tests**

`tests/manifest.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import {
  hash8, normalizeText, parseWeekFile, mergeManifest, orphanedProgressKeys, weekIdFromFile,
} from '@/lib/manifest'
import type { Manifest, Progress } from '@/lib/types'

const MD = `# Week 6 — Amazon EKS

**Lecture:** L06.

## Learn

- Controller hierarchy.

## Build — A04 checklist

- [ ] VPC with subnets
- [ ] Symmetric KMS key

## Definition of done

\`terraform apply\` works.
`

describe('parseWeekFile', () => {
  const week = parseWeekFile('week-06-eks.md', MD, 6)
  it('extracts id, title, order, file', () => {
    expect(week.id).toBe('week-06')
    expect(week.title).toBe('Week 6 — Amazon EKS')
    expect(week.order).toBe(6)
    expect(week.file).toBe('week-06-eks.md')
  })
  it('extracts checklist items in order with stable ids', () => {
    expect(week.items.map(i => i.text)).toEqual(['VPC with subnets', 'Symmetric KMS key'])
    expect(week.items[0].id).toBe(`week-06:0:${hash8('VPC with subnets')}`)
    expect(week.items[1].index).toBe(1)
  })
  it('extracts definition of done section', () => {
    expect(week.dod).toContain('terraform apply')
  })
})

describe('weekIdFromFile', () => {
  it('rejects unexpected names', () => {
    expect(() => weekIdFromFile('notes.md')).toThrow()
  })
})

describe('normalizeText / hash8', () => {
  it('normalization ignores case and whitespace', () => {
    expect(hash8('VPC  with subnets')).toBe(hash8('vpc with subnets'))
    expect(normalizeText('  A  b ')).toBe('a b')
  })
})

function manifestWith(md: string): Manifest {
  return { generatedAt: 't', weeks: [parseWeekFile('week-06-eks.md', md, 6)], extras: [] }
}

describe('mergeManifest', () => {
  it('returns next unchanged when prev is null', () => {
    const next = manifestWith(MD)
    expect(mergeManifest(null, next)).toEqual({ manifest: next, orphans: [] })
  })
  it('keeps the old id when an item merely moves', () => {
    const prev = manifestWith(MD)
    const moved = MD.replace('- [ ] VPC with subnets\n- [ ] Symmetric KMS key', '- [ ] Symmetric KMS key\n- [ ] VPC with subnets')
    const { manifest, orphans } = mergeManifest(prev, manifestWith(moved))
    expect(orphans).toEqual([])
    const vpc = manifest.weeks[0].items.find(i => i.text === 'VPC with subnets')!
    expect(vpc.id).toBe(prev.weeks[0].items[0].id)
  })
  it('reports removed items as orphans and never deletes progress', () => {
    const prev = manifestWith(MD)
    const removed = MD.replace('- [ ] Symmetric KMS key\n', '')
    const { orphans } = mergeManifest(prev, manifestWith(removed))
    expect(orphans.map(o => o.text)).toEqual(['Symmetric KMS key'])
    const progress: Progress = { items: { [prev.weeks[0].items[1].id]: { done: true, at: 'x' } }, weeks: {} }
    expect(orphanedProgressKeys(orphans, progress)).toEqual([prev.weeks[0].items[1].id])
  })
  it('mints a fresh id for changed text', () => {
    const prev = manifestWith(MD)
    const edited = MD.replace('VPC with subnets', 'VPC with 6 subnets')
    const { manifest, orphans } = mergeManifest(prev, manifestWith(edited))
    expect(orphans.map(o => o.text)).toEqual(['VPC with subnets'])
    expect(manifest.weeks[0].items[0].id).not.toBe(prev.weeks[0].items[0].id)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/manifest.test.ts`
Expected: FAIL — cannot resolve `@/lib/manifest`.

- [ ] **Step 3: Implement**

`lib/manifest.ts`:
```ts
import crypto from 'node:crypto'
import type { Manifest, ManifestItem, ManifestWeek, Progress } from './types'

export function normalizeText(t: string): string {
  return t.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function hash8(t: string): string {
  return crypto.createHash('sha256').update(normalizeText(t)).digest('hex').slice(0, 8)
}

export function weekIdFromFile(fileName: string): string {
  const m = fileName.match(/^(week-\d{2})/)
  if (!m) throw new Error(`unexpected week file name: ${fileName}`)
  return m[1]
}

const TASK_RE = /^\s*-\s\[[ xX]\]\s+(.*)$/

export function extractSection(md: string, heading: string): string | null {
  const lines = md.split('\n')
  const out: string[] = []
  let inSection = false
  let found = false
  for (const line of lines) {
    if (line.trim().toLowerCase().startsWith(heading.toLowerCase())) {
      inSection = true
      found = true
      continue
    }
    if (inSection && line.startsWith('## ')) inSection = false
    if (inSection) out.push(line)
  }
  return found ? out.join('\n').trim() : null
}

export function parseWeekFile(fileName: string, md: string, order: number): ManifestWeek {
  const weekId = weekIdFromFile(fileName)
  const lines = md.split('\n')
  const titleLine = lines.find(l => l.startsWith('# '))
  const title = titleLine ? titleLine.slice(2).trim() : weekId
  const items: ManifestItem[] = []
  for (const line of lines) {
    const m = line.match(TASK_RE)
    if (m) {
      const text = m[1].trim()
      items.push({ id: `${weekId}:${items.length}:${hash8(text)}`, weekId, index: items.length, text })
    }
  }
  return { id: weekId, title, file: fileName, order, items, dod: extractSection(md, '## Definition of done') }
}

export function mergeManifest(prev: Manifest | null, next: Manifest): { manifest: Manifest; orphans: ManifestItem[] } {
  if (!prev) return { manifest: next, orphans: [] }
  const orphans: ManifestItem[] = []
  for (const week of next.weeks) {
    const prevWeek = prev.weeks.find(w => w.id === week.id)
    if (!prevWeek) continue
    const claimed = new Set<string>()
    for (const item of week.items) {
      const h = item.id.split(':')[2]
      const match = prevWeek.items.find(p => p.id.split(':')[2] === h && !claimed.has(p.id))
      if (match) {
        claimed.add(match.id)
        item.id = match.id
      }
    }
    const nextIds = new Set(week.items.map(i => i.id))
    for (const p of prevWeek.items) if (!nextIds.has(p.id)) orphans.push(p)
  }
  for (const prevWeek of prev.weeks) {
    if (!next.weeks.some(w => w.id === prevWeek.id)) orphans.push(...prevWeek.items)
  }
  return { manifest: next, orphans }
}

export function orphanedProgressKeys(orphans: ManifestItem[], progress: Progress): string[] {
  return orphans.map(o => o.id).filter(id => id in progress.items)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/manifest.ts tests/manifest.test.ts
git commit -m "feat: add manifest parsing with stable checklist item ids"
```

---

### Task 4: Streaks and heatmap math

**Files:**
- Create: `lib/streaks.ts`
- Test: `tests/streaks.test.ts`

**Interfaces:**
- Consumes: `Progress`, `Sessions` from `lib/types.ts`.
- Produces:
  - `toLocalYMD(iso: string): string`, `todayYMD(): string`, `addDays(ymd: string, n: number): string`
  - `activeDays(progress: Progress, sessions: Sessions): Set<string>`
  - `currentStreak(days: Set<string>, today: string): number` — today-or-yesterday grace rule
  - `longestStreak(days: Set<string>): number`
  - `minutesByDay(sessions: Sessions): Record<string, number>`
  - `heatLevel(active: boolean, minutes: number): 0 | 1 | 2 | 3 | 4`
  - `heatmapCells(days: Set<string>, minutes: Record<string, number>, start: string, end: string): { date: string; level: 0 | 1 | 2 | 3 | 4 }[]`

- [ ] **Step 1: Write the failing tests**

`tests/streaks.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import {
  addDays, activeDays, currentStreak, heatLevel, heatmapCells, longestStreak, minutesByDay,
} from '@/lib/streaks'
import type { Progress, Sessions } from '@/lib/types'

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
  })
})

describe('activeDays', () => {
  it('unions checkbox days and session days', () => {
    const progress: Progress = { items: { a: { done: true, at: '2026-07-15T10:00:00' } }, weeks: { 'week-00': { dodDone: true, at: '2026-07-14T22:00:00' } } }
    const sessions: Sessions = { sessions: [{ date: '2026-07-13', minutes: 30 }] }
    expect(activeDays(progress, sessions)).toEqual(new Set(['2026-07-15', '2026-07-14', '2026-07-13']))
  })
})

describe('currentStreak', () => {
  const days = new Set(['2026-07-14', '2026-07-15', '2026-07-16'])
  it('counts consecutive days ending today', () => {
    expect(currentStreak(days, '2026-07-16')).toBe(3)
  })
  it("doesn't break if today is not yet active", () => {
    expect(currentStreak(days, '2026-07-17')).toBe(3)
  })
  it('is 0 after a gap of more than one day', () => {
    expect(currentStreak(days, '2026-07-19')).toBe(0)
  })
})

describe('longestStreak', () => {
  it('finds the longest run', () => {
    expect(longestStreak(new Set(['2026-07-01', '2026-07-02', '2026-07-04', '2026-07-05', '2026-07-06']))).toBe(3)
    expect(longestStreak(new Set())).toBe(0)
  })
})

describe('heatLevel', () => {
  it('gives checkbox-only days minimum intensity', () => {
    expect(heatLevel(true, 0)).toBe(1)
    expect(heatLevel(false, 0)).toBe(0)
  })
  it('buckets by minutes', () => {
    expect(heatLevel(true, 30)).toBe(1)
    expect(heatLevel(true, 45)).toBe(2)
    expect(heatLevel(true, 90)).toBe(3)
    expect(heatLevel(true, 180)).toBe(4)
  })
})

describe('heatmapCells + minutesByDay', () => {
  it('produces one cell per day in range with summed minutes', () => {
    const sessions: Sessions = { sessions: [{ date: '2026-07-15', minutes: 20 }, { date: '2026-07-15', minutes: 25 }] }
    const minutes = minutesByDay(sessions)
    expect(minutes['2026-07-15']).toBe(45)
    const cells = heatmapCells(new Set(['2026-07-15']), minutes, '2026-07-14', '2026-07-16')
    expect(cells).toEqual([
      { date: '2026-07-14', level: 0 },
      { date: '2026-07-15', level: 2 },
      { date: '2026-07-16', level: 0 },
    ])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/streaks.test.ts`
Expected: FAIL — cannot resolve `@/lib/streaks`.

- [ ] **Step 3: Implement**

`lib/streaks.ts`:
```ts
import type { Progress, Sessions } from './types'

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function toLocalYMD(iso: string): string {
  return fmt(new Date(iso))
}

export function todayYMD(): string {
  return fmt(new Date())
}

export function addDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split('-').map(Number)
  return fmt(new Date(y, m - 1, d + n))
}

export function activeDays(progress: Progress, sessions: Sessions): Set<string> {
  const days = new Set<string>()
  for (const v of Object.values(progress.items)) days.add(toLocalYMD(v.at))
  for (const v of Object.values(progress.weeks)) days.add(toLocalYMD(v.at))
  for (const s of sessions.sessions) days.add(s.date)
  return days
}

export function currentStreak(days: Set<string>, today: string): number {
  let cursor = days.has(today) ? today : addDays(today, -1)
  let count = 0
  while (days.has(cursor)) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}

export function longestStreak(days: Set<string>): number {
  let best = 0
  for (const day of days) {
    if (days.has(addDays(day, -1))) continue
    let len = 0
    let cursor = day
    while (days.has(cursor)) {
      len++
      cursor = addDays(cursor, 1)
    }
    best = Math.max(best, len)
  }
  return best
}

export function minutesByDay(sessions: Sessions): Record<string, number> {
  const out: Record<string, number> = {}
  for (const s of sessions.sessions) out[s.date] = (out[s.date] ?? 0) + s.minutes
  return out
}

export type HeatCell = { date: string; level: 0 | 1 | 2 | 3 | 4 }

export function heatLevel(active: boolean, minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (!active && minutes <= 0) return 0
  if (minutes <= 30) return 1
  if (minutes <= 60) return 2
  if (minutes <= 120) return 3
  return 4
}

export function heatmapCells(days: Set<string>, minutes: Record<string, number>, start: string, end: string): HeatCell[] {
  const cells: HeatCell[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) {
    cells.push({ date: d, level: heatLevel(days.has(d), minutes[d] ?? 0) })
  }
  return cells
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/streaks.ts tests/streaks.test.ts
git commit -m "feat: add streak and heatmap date math"
```

---

### Task 5: API logic + route wrappers

**Files:**
- Create: `lib/state.ts`, `lib/api.ts`, `app/api/state/route.ts`, `app/api/progress/route.ts`, `app/api/sessions/route.ts`
- Test: `tests/api.test.ts`

**Interfaces:**
- Consumes: `readJson`/`writeJsonAtomic`, paths, types, `todayYMD` from Task 4.
- Produces:
  - `lib/state.ts`: `emptyProgress(): Progress`, `emptySessions(): Sessions`, `loadState(): AppState` where `AppState = { manifest: Manifest | null; progress: Progress; sessions: Sessions; corrupt: { progress: boolean; sessions: boolean } }`, `weekStatus(week: ManifestWeek, progress: Progress): 'notStarted' | 'inProgress' | 'done'`, `readContent(rel: string): string | null`
  - `lib/api.ts`: `ApiResult = { status: number; body: unknown }`; `applyProgress(body: unknown): ApiResult`; `addSession(body: unknown): ApiResult`; `getState(): ApiResult`
  - Route files export `GET`/`POST` handlers wrapping these with `NextResponse.json(r.body, { status: r.status })`.

- [ ] **Step 1: Write the failing tests**

`tests/api.test.ts`:
```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { writeJsonAtomic, readJson } from '@/lib/fsjson'
import { manifestPath, progressPath, sessionsPath } from '@/lib/paths'
import { applyProgress, addSession, getState } from '@/lib/api'
import { weekStatus } from '@/lib/state'
import type { Manifest, ManifestWeek, Progress, Sessions } from '@/lib/types'

const week: ManifestWeek = {
  id: 'week-00', title: 'Week 0', file: 'week-00-setup.md', order: 0, dod: 'done text',
  items: [
    { id: 'week-00:0:aaaaaaaa', weekId: 'week-00', index: 0, text: 'item one' },
    { id: 'week-00:1:bbbbbbbb', weekId: 'week-00', index: 1, text: 'item two' },
  ],
}
const manifest: Manifest = { generatedAt: 't', weeks: [week], extras: [] }

let dir: string
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'api-'))
  process.env.DATA_DIR = dir
  writeJsonAtomic(manifestPath(), manifest)
})
afterEach(() => {
  delete process.env.DATA_DIR
})

describe('applyProgress', () => {
  it('checks and unchecks an item', () => {
    expect(applyProgress({ itemId: 'week-00:0:aaaaaaaa', done: true }).status).toBe(200)
    let p = readJson<Progress>(progressPath())
    expect(p.ok && p.data.items['week-00:0:aaaaaaaa'].done).toBe(true)
    expect(applyProgress({ itemId: 'week-00:0:aaaaaaaa', done: false }).status).toBe(200)
    p = readJson<Progress>(progressPath())
    expect(p.ok && 'week-00:0:aaaaaaaa' in p.data.items).toBe(false)
  })
  it('sets the week definition-of-done flag', () => {
    expect(applyProgress({ weekId: 'week-00', done: true }).status).toBe(200)
    const p = readJson<Progress>(progressPath())
    expect(p.ok && p.data.weeks['week-00'].dodDone).toBe(true)
  })
  it('rejects unknown ids and bad bodies', () => {
    expect(applyProgress({ itemId: 'nope', done: true }).status).toBe(400)
    expect(applyProgress({ weekId: 'nope', done: true }).status).toBe(400)
    expect(applyProgress({ done: true }).status).toBe(400)
    expect(applyProgress(null).status).toBe(400)
  })
  it('refuses to overwrite a corrupt progress file', () => {
    fs.writeFileSync(progressPath(), '{ nope')
    expect(applyProgress({ itemId: 'week-00:0:aaaaaaaa', done: true }).status).toBe(409)
    expect(fs.readFileSync(progressPath(), 'utf8')).toBe('{ nope')
  })
})

describe('addSession', () => {
  it('appends a session with defaulted date', () => {
    expect(addSession({ minutes: 45, weekId: 'week-00', note: 'eks' }).status).toBe(200)
    const s = readJson<Sessions>(sessionsPath())
    expect(s.ok && s.data.sessions[0].minutes).toBe(45)
    expect(s.ok && /^\d{4}-\d{2}-\d{2}$/.test(s.data.sessions[0].date)).toBe(true)
  })
  it('validates minutes, date format, and weekId', () => {
    expect(addSession({ minutes: 0 }).status).toBe(400)
    expect(addSession({ minutes: -5 }).status).toBe(400)
    expect(addSession({ minutes: 1.5 }).status).toBe(400)
    expect(addSession({ minutes: 30, date: '17-07-2026' }).status).toBe(400)
    expect(addSession({ minutes: 30, weekId: 'nope' }).status).toBe(400)
  })
  it('refuses to overwrite a corrupt sessions file', () => {
    fs.writeFileSync(sessionsPath(), '{ nope')
    expect(addSession({ minutes: 30 }).status).toBe(409)
  })
})

describe('getState', () => {
  it('returns manifest, progress, sessions, corrupt flags', () => {
    fs.writeFileSync(progressPath(), '{ nope')
    const r = getState()
    expect(r.status).toBe(200)
    const body = r.body as { manifest: Manifest; corrupt: { progress: boolean } }
    expect(body.manifest.weeks[0].id).toBe('week-00')
    expect(body.corrupt.progress).toBe(true)
  })
})

describe('weekStatus', () => {
  it('walks notStarted -> inProgress -> done', () => {
    const none: Progress = { items: {}, weeks: {} }
    expect(weekStatus(week, none)).toBe('notStarted')
    const some: Progress = { items: { 'week-00:0:aaaaaaaa': { done: true, at: 'x' } }, weeks: {} }
    expect(weekStatus(week, some)).toBe('inProgress')
    const all: Progress = {
      items: { 'week-00:0:aaaaaaaa': { done: true, at: 'x' }, 'week-00:1:bbbbbbbb': { done: true, at: 'x' } },
      weeks: { 'week-00': { dodDone: true, at: 'x' } },
    }
    expect(weekStatus(week, all)).toBe('done')
    const noDod: Progress = { ...all, weeks: {} }
    expect(weekStatus(week, noDod)).toBe('inProgress')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/api.test.ts`
Expected: FAIL — cannot resolve `@/lib/api` / `@/lib/state`.

- [ ] **Step 3: Implement**

`lib/state.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'
import { readJson } from './fsjson'
import { contentDir, manifestPath, progressPath, sessionsPath } from './paths'
import type { Manifest, ManifestWeek, Progress, Sessions } from './types'

export const emptyProgress = (): Progress => ({ items: {}, weeks: {} })
export const emptySessions = (): Sessions => ({ sessions: [] })

export interface AppState {
  manifest: Manifest | null
  progress: Progress
  sessions: Sessions
  corrupt: { progress: boolean; sessions: boolean }
}

export function loadState(): AppState {
  const m = readJson<Manifest>(manifestPath())
  const p = readJson<Progress>(progressPath())
  const s = readJson<Sessions>(sessionsPath())
  return {
    manifest: m.ok ? m.data : null,
    progress: p.ok ? p.data : emptyProgress(),
    sessions: s.ok ? s.data : emptySessions(),
    corrupt: {
      progress: !p.ok && p.error === 'corrupt',
      sessions: !s.ok && s.error === 'corrupt',
    },
  }
}

export type WeekStatus = 'notStarted' | 'inProgress' | 'done'

export function weekStatus(week: ManifestWeek, progress: Progress): WeekStatus {
  const doneCount = week.items.filter(i => progress.items[i.id]?.done).length
  const dodDone = !!progress.weeks[week.id]?.dodDone
  const allItems = week.items.length > 0 && doneCount === week.items.length
  if (allItems && (week.dod === null || dodDone)) return 'done'
  if (doneCount > 0 || dodDone) return 'inProgress'
  return 'notStarted'
}

export function readContent(rel: string): string | null {
  try {
    return fs.readFileSync(path.join(contentDir(), rel), 'utf8')
  } catch {
    return null
  }
}
```

`lib/api.ts`:
```ts
import { readJson, writeJsonAtomic } from './fsjson'
import { manifestPath, progressPath, sessionsPath } from './paths'
import { emptyProgress, emptySessions, loadState } from './state'
import { todayYMD } from './streaks'
import type { Manifest, Progress, Session, Sessions } from './types'

export interface ApiResult {
  status: number
  body: unknown
}

const err = (status: number, message: string): ApiResult => ({ status, body: { error: message } })

export function applyProgress(body: unknown): ApiResult {
  const b = body as { itemId?: unknown; weekId?: unknown; done?: unknown } | null
  if (!b || typeof b.done !== 'boolean' || (typeof b.itemId !== 'string') === (typeof b.weekId !== 'string')) {
    return err(400, 'body must have done: boolean and exactly one of itemId or weekId')
  }
  const m = readJson<Manifest>(manifestPath())
  if (!m.ok) return err(500, 'manifest missing — run npm run ingest')
  const p = readJson<Progress>(progressPath())
  if (!p.ok && p.error === 'corrupt') return err(409, 'data/progress.json is corrupt — fix or delete it')
  const progress = p.ok ? p.data : emptyProgress()
  const at = new Date().toISOString()
  if (typeof b.itemId === 'string') {
    if (!m.data.weeks.some(w => w.items.some(i => i.id === b.itemId))) return err(400, 'unknown itemId')
    if (b.done) progress.items[b.itemId] = { done: true, at }
    else delete progress.items[b.itemId]
  } else {
    const weekId = b.weekId as string
    if (!m.data.weeks.some(w => w.id === weekId)) return err(400, 'unknown weekId')
    if (b.done) progress.weeks[weekId] = { dodDone: true, at }
    else delete progress.weeks[weekId]
  }
  try {
    writeJsonAtomic(progressPath(), progress)
  } catch (e) {
    return err(500, `write failed: ${String(e)}`)
  }
  return { status: 200, body: { ok: true } }
}

export function addSession(body: unknown): ApiResult {
  const b = body as { date?: unknown; minutes?: unknown; weekId?: unknown; note?: unknown } | null
  if (!b || typeof b.minutes !== 'number' || !Number.isInteger(b.minutes) || b.minutes <= 0) {
    return err(400, 'minutes must be a positive integer')
  }
  const date = b.date === undefined ? todayYMD() : b.date
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return err(400, 'date must be YYYY-MM-DD')
  if (b.weekId !== undefined) {
    const m = readJson<Manifest>(manifestPath())
    if (!m.ok || !m.data.weeks.some(w => w.id === b.weekId)) return err(400, 'unknown weekId')
  }
  const s = readJson<Sessions>(sessionsPath())
  if (!s.ok && s.error === 'corrupt') return err(409, 'data/sessions.json is corrupt — fix or delete it')
  const sessions = s.ok ? s.data : emptySessions()
  const session: Session = { date, minutes: b.minutes }
  if (typeof b.weekId === 'string') session.weekId = b.weekId
  if (typeof b.note === 'string' && b.note.trim() !== '') session.note = b.note.trim()
  sessions.sessions.push(session)
  try {
    writeJsonAtomic(sessionsPath(), sessions)
  } catch (e) {
    return err(500, `write failed: ${String(e)}`)
  }
  return { status: 200, body: { ok: true } }
}

export function getState(): ApiResult {
  return { status: 200, body: loadState() }
}
```

`app/api/state/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { getState } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET() {
  const r = getState()
  return NextResponse.json(r.body, { status: r.status })
}
```

`app/api/progress/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { applyProgress } from '@/lib/api'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const r = applyProgress(body)
  return NextResponse.json(r.body, { status: r.status })
}
```

`app/api/sessions/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { addSession } from '@/lib/api'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const r = addSession(body)
  return NextResponse.json(r.body, { status: r.status })
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests PASS.

Run: `npm run build`
Expected: build succeeds (routes compile).

- [ ] **Step 5: Commit**

```bash
git add lib/state.ts lib/api.ts app/api/ tests/api.test.ts
git commit -m "feat: add state loading and progress/session API"
```

---

### Task 6: Ingest script

**Files:**
- Create: `scripts/ingest.ts`
- Test: `tests/ingest.test.ts`

**Interfaces:**
- Consumes: `parseWeekFile`, `mergeManifest`, `orphanedProgressKeys` (Task 3); `readJson`, `writeJsonAtomic` (Task 2); paths (Task 2).
- Produces: `runIngest(srcDir: string): { weeks: number; items: number; orphans: ManifestItem[] }` (exported for tests) plus a CLI entry; `npm run ingest` populates `content/` (`README.md`, `reference.md`, `weeks/*.md`) and `data/manifest.json`.

- [ ] **Step 1: Write the failing test**

`tests/ingest.test.ts`:
```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { runIngest } from '@/scripts/ingest'
import { readJson } from '@/lib/fsjson'
import { manifestPath } from '@/lib/paths'
import type { Manifest } from '@/lib/types'

let src: string
let work: string
beforeEach(() => {
  src = fs.mkdtempSync(path.join(os.tmpdir(), 'course-src-'))
  work = fs.mkdtempSync(path.join(os.tmpdir(), 'course-work-'))
  process.env.DATA_DIR = path.join(work, 'data')
  process.env.CONTENT_DIR = path.join(work, 'content')
  fs.mkdirSync(path.join(src, 'weeks'))
  fs.mkdirSync(path.join(src, 'reference'))
  fs.writeFileSync(path.join(src, 'README.md'), '# Course\n')
  fs.writeFileSync(path.join(src, 'reference', 'worked-repos.md'), '# Repos\n')
  fs.writeFileSync(path.join(src, 'weeks', 'week-00-setup.md'), '# Week 0\n\n- [ ] install go\n\n## Definition of done\n\nok\n')
  fs.writeFileSync(path.join(src, 'weeks', 'week-01-x.md'), '# Week 1\n\n- [ ] read docs\n')
})
afterEach(() => {
  delete process.env.DATA_DIR
  delete process.env.CONTENT_DIR
})

describe('runIngest', () => {
  it('copies content and writes a manifest', () => {
    const result = runIngest(src)
    expect(result.weeks).toBe(2)
    expect(result.items).toBe(2)
    expect(fs.existsSync(path.join(work, 'content', 'README.md'))).toBe(true)
    expect(fs.existsSync(path.join(work, 'content', 'reference.md'))).toBe(true)
    expect(fs.existsSync(path.join(work, 'content', 'weeks', 'week-00-setup.md'))).toBe(true)
    const m = readJson<Manifest>(manifestPath())
    expect(m.ok && m.data.weeks.map(w => w.id)).toEqual(['week-00', 'week-01'])
    expect(m.ok && m.data.weeks[0].dod).toBe('ok')
  })
  it('preserves ids across re-ingest and reports orphans', () => {
    runIngest(src)
    const before = readJson<Manifest>(manifestPath())
    const beforeId = before.ok ? before.data.weeks[0].items[0].id : ''
    fs.writeFileSync(path.join(src, 'weeks', 'week-00-setup.md'), '# Week 0\n\n- [ ] something new\n- [ ] install go\n')
    const result = runIngest(src)
    expect(result.orphans).toEqual([])
    const after = readJson<Manifest>(manifestPath())
    const kept = after.ok ? after.data.weeks[0].items.find(i => i.text === 'install go') : undefined
    expect(kept?.id).toBe(beforeId)
  })
  it('throws when the source is missing', () => {
    expect(() => runIngest(path.join(src, 'nope'))).toThrow(/not found/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/ingest.test.ts`
Expected: FAIL — cannot resolve `@/scripts/ingest`.

- [ ] **Step 3: Implement**

`scripts/ingest.ts`:
```ts
import fs from 'node:fs'
import path from 'node:path'
import { mergeManifest, orphanedProgressKeys, parseWeekFile } from '../lib/manifest'
import { readJson, writeJsonAtomic } from '../lib/fsjson'
import { contentDir, manifestPath, progressPath } from '../lib/paths'
import type { Manifest, ManifestItem, Progress } from '../lib/types'

export function runIngest(srcDir: string): { weeks: number; items: number; orphans: ManifestItem[] } {
  const weeksDir = path.join(srcDir, 'weeks')
  if (!fs.existsSync(weeksDir)) {
    throw new Error(`Course docs not found at ${srcDir} — set COURSE_DOCS_DIR to the course directory`)
  }
  fs.mkdirSync(path.join(contentDir(), 'weeks'), { recursive: true })
  fs.copyFileSync(path.join(srcDir, 'README.md'), path.join(contentDir(), 'README.md'))
  fs.copyFileSync(path.join(srcDir, 'reference', 'worked-repos.md'), path.join(contentDir(), 'reference.md'))

  const weekFiles = fs.readdirSync(weeksDir).filter(f => f.endsWith('.md')).sort()
  const weeks = weekFiles.map((f, i) => {
    const md = fs.readFileSync(path.join(weeksDir, f), 'utf8')
    fs.copyFileSync(path.join(weeksDir, f), path.join(contentDir(), 'weeks', f))
    return parseWeekFile(f, md, i)
  })

  const next: Manifest = {
    generatedAt: new Date().toISOString(),
    weeks,
    extras: [
      { file: 'README.md', title: 'Course README' },
      { file: 'reference.md', title: 'Worked Repos Reference' },
    ],
  }
  const prev = readJson<Manifest>(manifestPath())
  const { manifest, orphans } = mergeManifest(prev.ok ? prev.data : null, next)

  if (orphans.length > 0) {
    console.log(`⚠ ${orphans.length} previously-known checklist item(s) no longer exist in the course docs:`)
    for (const o of orphans) console.log(`  - [${o.weekId}] ${o.text}`)
    const prog = readJson<Progress>(progressPath())
    const keys = orphanedProgressKeys(orphans, prog.ok ? prog.data : { items: {}, weeks: {} })
    if (keys.length > 0) {
      console.log(`  ${keys.length} progress entr(y/ies) reference them and were KEPT in progress.json: ${keys.join(', ')}`)
    }
  }

  writeJsonAtomic(manifestPath(), manifest)
  const items = manifest.weeks.reduce((n, w) => n + w.items.length, 0)
  return { weeks: manifest.weeks.length, items, orphans }
}

const isCli = process.argv[1] !== undefined && path.resolve(process.argv[1]) === path.resolve('scripts/ingest.ts')
if (isCli) {
  const src = process.env.COURSE_DOCS_DIR
    ?? path.resolve(process.cwd(), '../../../workspace-docs/courses/advanced-cloud-computing')
  try {
    const r = runIngest(src)
    console.log(`Ingested ${r.weeks} weeks, ${r.items} checklist items from ${src}`)
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e))
    process.exit(1)
  }
}
```

- [ ] **Step 4: Run tests, then run the real ingest**

Run: `npm test`
Expected: all tests PASS.

Run: `npm run ingest`
Expected: `Ingested 13 weeks, <N> checklist items from .../workspace-docs/courses/advanced-cloud-computing` and `content/` + `data/manifest.json` now exist. (N is well over 100 — Week 0 alone has ~20.)

- [ ] **Step 5: Commit (including generated content + manifest — they are committed by design)**

```bash
git add scripts/ tests/ingest.test.ts content/ data/manifest.json
git commit -m "feat: add course ingest script and ingest current course docs"
```

---

### Task 7: Markdown rendering

**Files:**
- Create: `lib/markdown.ts`
- Test: `tests/markdown.test.ts`

**Interfaces:**
- Consumes: `ManifestItem`, `Progress` types; `marked` (pinned 12.0.2).
- Produces:
  - `renderMarkdown(md: string): string` — GFM HTML string
  - `renderWeekHtml(md: string, items: ManifestItem[], progress: Progress): string` — same, but each task checkbox becomes `<input type="checkbox" data-item-id="<id>">` (with `checked` when done), assigned in document order
  - `rewriteCourseLinks(html: string): string` — `href="weeks/week-NN-…md"` → `href="/weeks/week-NN"`, `href="reference/worked-repos.md"` → `href="/reference"`

- [ ] **Step 1: Write the failing tests**

`tests/markdown.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { renderMarkdown, renderWeekHtml, rewriteCourseLinks } from '@/lib/markdown'
import type { ManifestItem, Progress } from '@/lib/types'

const MD = `# Title

- [ ] first item
- [ ] second item
`
const items: ManifestItem[] = [
  { id: 'week-00:0:aaaaaaaa', weekId: 'week-00', index: 0, text: 'first item' },
  { id: 'week-00:1:bbbbbbbb', weekId: 'week-00', index: 1, text: 'second item' },
]

describe('renderWeekHtml', () => {
  it('tags every checkbox with its manifest item id in order', () => {
    const html = renderWeekHtml(MD, items, { items: {}, weeks: {} })
    const idsInOrder = [...html.matchAll(/data-item-id="([^"]+)"/g)].map(m => m[1])
    expect(idsInOrder).toEqual(['week-00:0:aaaaaaaa', 'week-00:1:bbbbbbbb'])
    expect(html).not.toContain('disabled')
  })
  it('marks done items checked', () => {
    const progress: Progress = { items: { 'week-00:1:bbbbbbbb': { done: true, at: 'x' } }, weeks: {} }
    const html = renderWeekHtml(MD, items, progress)
    expect(html).toContain('data-item-id="week-00:1:bbbbbbbb" checked')
    expect(html).not.toContain('data-item-id="week-00:0:aaaaaaaa" checked')
  })
})

describe('renderMarkdown', () => {
  it('renders headings and links', () => {
    const html = renderMarkdown('# H\n\n[x](https://example.com)')
    expect(html).toContain('<h1')
    expect(html).toContain('href="https://example.com"')
  })
})

describe('rewriteCourseLinks', () => {
  it('rewrites week and reference links to app routes', () => {
    const html = '<a href="weeks/week-06-eks.md">w</a> <a href="reference/worked-repos.md">r</a>'
    expect(rewriteCourseLinks(html)).toBe('<a href="/weeks/week-06">w</a> <a href="/reference">r</a>')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/markdown.test.ts`
Expected: FAIL — cannot resolve `@/lib/markdown`.

- [ ] **Step 3: Implement**

`lib/markdown.ts`:
```ts
import { marked } from 'marked'
import type { ManifestItem, Progress } from './types'

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false, gfm: true }) as string
}

// marked 12.0.2 renders task-list checkboxes as:
//   <input checked="" disabled="" type="checkbox"> or <input disabled="" type="checkbox">
// The version is pinned exactly because this regex depends on that output.
const CHECKBOX_RE = /<input (?:checked="" )?disabled="" type="checkbox">/g

export function renderWeekHtml(md: string, items: ManifestItem[], progress: Progress): string {
  let i = 0
  return renderMarkdown(md).replace(CHECKBOX_RE, () => {
    const item = items[i++]
    if (!item) return '<input type="checkbox">'
    const checked = progress.items[item.id]?.done ? ' checked' : ''
    return `<input type="checkbox" data-item-id="${item.id}"${checked}>`
  })
}

export function rewriteCourseLinks(html: string): string {
  return html
    .replace(/href="weeks\/(week-\d{2})[^"]*"/g, 'href="/weeks/$1"')
    .replace(/href="reference\/worked-repos\.md"/g, 'href="/reference"')
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests PASS. If the checkbox test fails with zero matches, marked's output format drifted — check `node -e "const {marked}=require('marked');console.log(marked.parse('- [ ] x'))"` and fix `CHECKBOX_RE` to match, do NOT unpin the version.

- [ ] **Step 5: Commit**

```bash
git add lib/markdown.ts tests/markdown.test.ts
git commit -m "feat: add markdown rendering with id-tagged task checkboxes"
```

---

### Task 8: Dashboard page

**Files:**
- Create: `components/WeekCard.tsx`, `components/Heatmap.tsx`, `components/SessionForm.tsx`, `components/CorruptBanner.tsx`, `components/SetupNotice.tsx`
- Modify: `app/page.tsx` (replace placeholder entirely)

**Interfaces:**
- Consumes: `loadState`, `weekStatus` (Task 5); `activeDays`, `currentStreak`, `longestStreak`, `minutesByDay`, `heatmapCells`, `todayYMD`, `addDays`, `HeatCell` (Task 4).
- Produces: `WeekCard({ week, progress })`, `Heatmap({ cells })`, `SessionForm({ weeks })` (client), `CorruptBanner({ corrupt })`, `SetupNotice()` — reused by Tasks 9–10.

- [ ] **Step 1: Write the components**

`components/SetupNotice.tsx`:
```tsx
export default function SetupNotice() {
  return (
    <div className="rounded border border-amber-400 bg-amber-50 p-4 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      <p className="font-medium">No course content found.</p>
      <p className="mt-1 text-sm">Run <code>npm run ingest</code> from the project root, then reload.</p>
    </div>
  )
}
```

`components/CorruptBanner.tsx`:
```tsx
export default function CorruptBanner({ corrupt }: { corrupt: { progress: boolean; sessions: boolean } }) {
  const files = [corrupt.progress && 'data/progress.json', corrupt.sessions && 'data/sessions.json'].filter(Boolean)
  if (files.length === 0) return null
  return (
    <div className="mb-6 rounded border border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
      {files.join(' and ')} unreadable — fix or delete the file(s). Saving is disabled for corrupt files.
    </div>
  )
}
```

`components/WeekCard.tsx`:
```tsx
import Link from 'next/link'
import { weekStatus } from '@/lib/state'
import type { ManifestWeek, Progress } from '@/lib/types'

const badge = {
  notStarted: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  inProgress: 'bg-amber-200 text-amber-900',
  done: 'bg-emerald-200 text-emerald-900',
}
const label = { notStarted: 'Not started', inProgress: 'In progress', done: 'Done' }

export default function WeekCard({ week, progress }: { week: ManifestWeek; progress: Progress }) {
  const status = weekStatus(week, progress)
  const done = week.items.filter(i => progress.items[i.id]?.done).length
  const pct = week.items.length > 0 ? Math.round((done / week.items.length) * 100) : 0
  return (
    <Link href={`/weeks/${week.id}`} className="block rounded-lg border border-neutral-300 p-4 hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-400">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{week.title}</h3>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs ${badge[status]}`}>{label[status]}</span>
      </div>
      <div className="mt-3 h-2 rounded bg-neutral-200 dark:bg-neutral-800">
        <div className="h-2 rounded bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-neutral-500">{done}/{week.items.length} tasks</p>
    </Link>
  )
}
```

`components/Heatmap.tsx`:
```tsx
import type { HeatCell } from '@/lib/streaks'

const colors = [
  'bg-neutral-200 dark:bg-neutral-800',
  'bg-emerald-200',
  'bg-emerald-400',
  'bg-emerald-600',
  'bg-emerald-800',
]

export default function Heatmap({ cells }: { cells: HeatCell[] }) {
  const cols: HeatCell[][] = []
  for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7))
  return (
    <div className="flex gap-1 overflow-x-auto">
      {cols.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-1">
          {col.map(c => (
            <div key={c.date} title={c.date} className={`h-3 w-3 rounded-sm ${colors[c.level]}`} />
          ))}
        </div>
      ))}
    </div>
  )
}
```

`components/SessionForm.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SessionForm({ weeks }: { weeks: { id: string; title: string }[] }) {
  const router = useRouter()
  const [minutes, setMinutes] = useState('30')
  const [weekId, setWeekId] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes: Number(minutes), weekId: weekId || undefined, note: note || undefined }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'failed to log session')
      return
    }
    setNote('')
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <label className="text-sm">
        Minutes
        <input type="number" min="1" value={minutes} onChange={e => setMinutes(e.target.value)}
          className="mt-1 block w-24 rounded border border-neutral-300 bg-transparent px-2 py-1 dark:border-neutral-700" />
      </label>
      <label className="text-sm">
        Week
        <select value={weekId} onChange={e => setWeekId(e.target.value)}
          className="mt-1 block rounded border border-neutral-300 bg-transparent px-2 py-1 dark:border-neutral-700 dark:bg-neutral-950">
          <option value="">—</option>
          {weeks.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
        </select>
      </label>
      <label className="text-sm">
        Note
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="optional"
          className="mt-1 block w-48 rounded border border-neutral-300 bg-transparent px-2 py-1 dark:border-neutral-700" />
      </label>
      <button type="submit" className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">
        Log session
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  )
}
```

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
import CorruptBanner from '@/components/CorruptBanner'
import Heatmap from '@/components/Heatmap'
import SessionForm from '@/components/SessionForm'
import SetupNotice from '@/components/SetupNotice'
import WeekCard from '@/components/WeekCard'
import { loadState } from '@/lib/state'
import { activeDays, addDays, currentStreak, heatmapCells, longestStreak, minutesByDay, todayYMD } from '@/lib/streaks'

export const dynamic = 'force-dynamic'

export default function Dashboard() {
  const { manifest, progress, sessions, corrupt } = loadState()
  if (!manifest) return <SetupNotice />

  const totalItems = manifest.weeks.reduce((n, w) => n + w.items.length, 0)
  const doneItems = Object.keys(progress.items).length
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0

  const days = activeDays(progress, sessions)
  const today = todayYMD()
  const cells = heatmapCells(days, minutesByDay(sessions), addDays(today, -118), today)

  return (
    <div>
      <CorruptBanner corrupt={corrupt} />
      <section className="flex flex-wrap items-center gap-8">
        <div>
          <p className="text-4xl font-bold">{pct}%</p>
          <p className="text-sm text-neutral-500">{doneItems}/{totalItems} tasks done</p>
        </div>
        <div>
          <p className="text-4xl font-bold">{currentStreak(days, today)}<span className="text-base font-normal"> days</span></p>
          <p className="text-sm text-neutral-500">current streak (longest {longestStreak(days)})</p>
        </div>
      </section>
      <section className="mt-6">
        <Heatmap cells={cells} />
      </section>
      <section className="mt-8 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">Log a study session</h2>
        <SessionForm weeks={manifest.weeks.map(w => ({ id: w.id, title: w.title }))} />
      </section>
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {manifest.weeks.map(w => <WeekCard key={w.id} week={w} progress={progress} />)}
      </section>
    </div>
  )
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: build succeeds.

Run: `npm run dev` then open http://localhost:3000
Expected: dashboard shows 0%, a 17-week heatmap of empty cells, the session form, and 13 week cards all "Not started". Log a 30-minute session → page refreshes, streak becomes 1, today's heatmap cell turns green.

- [ ] **Step 4: Commit**

```bash
git add components/ app/page.tsx
git commit -m "feat: add dashboard with progress, streaks, heatmap, and session log"
```

---

### Task 9: Week pages with live checkboxes

**Files:**
- Create: `app/weeks/[id]/page.tsx`, `components/WeekContent.tsx`, `components/DodToggle.tsx`

**Interfaces:**
- Consumes: `loadState`, `readContent`, `weekStatus` (Task 5); `renderWeekHtml` (Task 7); `CorruptBanner`, `SetupNotice` (Task 8).
- Produces: route `/weeks/[id]`; `WeekContent({ html })` and `DodToggle({ weekId, done })` client components.

- [ ] **Step 1: Write the client components**

`components/WeekContent.tsx`:
```tsx
'use client'
import { useRouter } from 'next/navigation'

export default function WeekContent({ html }: { html: string }) {
  const router = useRouter()

  async function onClick(e: React.MouseEvent) {
    const t = e.target as HTMLElement
    if (!(t instanceof HTMLInputElement) || t.type !== 'checkbox' || !t.dataset.itemId) return
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: t.dataset.itemId, done: t.checked }),
    })
    if (!res.ok) {
      t.checked = !t.checked
      const body = await res.json().catch(() => ({}))
      alert(body.error ?? 'failed to save')
      return
    }
    router.refresh()
  }

  return (
    <article
      onClick={onClick}
      className="prose prose-neutral max-w-none dark:prose-invert prose-li:my-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
```

`components/DodToggle.tsx`:
```tsx
'use client'
import { useRouter } from 'next/navigation'

export default function DodToggle({ weekId, done }: { weekId: string; done: boolean }) {
  const router = useRouter()

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekId, done: e.target.checked }),
    })
    if (res.ok) router.refresh()
  }

  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" checked={done} onChange={onChange} />
      Definition of done met
    </label>
  )
}
```

- [ ] **Step 2: Write the page**

`app/weeks/[id]/page.tsx`:
```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CorruptBanner from '@/components/CorruptBanner'
import DodToggle from '@/components/DodToggle'
import SetupNotice from '@/components/SetupNotice'
import WeekContent from '@/components/WeekContent'
import { renderWeekHtml } from '@/lib/markdown'
import { loadState, readContent } from '@/lib/state'

export const dynamic = 'force-dynamic'

export default async function WeekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { manifest, progress, corrupt } = loadState()
  if (!manifest) return <SetupNotice />
  const week = manifest.weeks.find(w => w.id === id)
  if (!week) notFound()
  const md = readContent(`weeks/${week.file}`)
  if (!md) return <SetupNotice />

  const idx = manifest.weeks.findIndex(w => w.id === id)
  const prev = manifest.weeks[idx - 1]
  const next = manifest.weeks[idx + 1]

  return (
    <div>
      <CorruptBanner corrupt={corrupt} />
      <div className="mb-6 flex items-center justify-between text-sm">
        {prev ? <Link href={`/weeks/${prev.id}`} className="text-neutral-500 hover:underline">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/weeks/${next.id}`} className="text-neutral-500 hover:underline">{next.title} →</Link> : <span />}
      </div>
      <WeekContent html={renderWeekHtml(md, week.items, progress)} />
      {week.dod !== null && (
        <div className="mt-8 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700">
          <DodToggle weekId={week.id} done={!!progress.weeks[week.id]?.dodDone} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: build succeeds.

Run: `npm run dev`, open http://localhost:3000/weeks/week-00
Expected: Week 0 renders with real checkboxes; checking one persists (reload keeps it; `data/progress.json` gains an entry; dashboard card shows 1 task done). Checking "Definition of done met" flips the card toward done. `/weeks/nope` → 404.

- [ ] **Step 4: Commit**

```bash
git add app/weeks/ components/WeekContent.tsx components/DodToggle.tsx
git commit -m "feat: add week pages with persistent checklist checkboxes"
```

---

### Task 10: Course map, reference page, README, final pass

**Files:**
- Create: `app/course/page.tsx`, `app/reference/page.tsx`, `README.md`
- Modify: none

**Interfaces:**
- Consumes: `readContent` (Task 5), `renderMarkdown`, `rewriteCourseLinks` (Task 7), `SetupNotice` (Task 8).

- [ ] **Step 1: Write the pages**

`app/course/page.tsx`:
```tsx
import SetupNotice from '@/components/SetupNotice'
import { renderMarkdown, rewriteCourseLinks } from '@/lib/markdown'
import { readContent } from '@/lib/state'

export const dynamic = 'force-dynamic'

export default function CoursePage() {
  const md = readContent('README.md')
  if (!md) return <SetupNotice />
  const html = rewriteCourseLinks(renderMarkdown(md))
  return <article className="prose prose-neutral max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
}
```

`app/reference/page.tsx`:
```tsx
import SetupNotice from '@/components/SetupNotice'
import { renderMarkdown } from '@/lib/markdown'
import { readContent } from '@/lib/state'

export const dynamic = 'force-dynamic'

export default function ReferencePage() {
  const md = readContent('reference.md')
  if (!md) return <SetupNotice />
  return <article className="prose prose-neutral max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />
}
```

`README.md`:
```markdown
# advanced-cloud-course

Local-first dashboard + website for the self-paced Advanced Cloud Computing course
(content source: `../../../workspace-docs/courses/advanced-cloud-computing/`).

## Usage

​```bash
npm install
npm run ingest   # re-run whenever the course docs change
npm run dev      # http://localhost:3000
npm test
​```

Progress (`data/progress.json`) and study sessions (`data/sessions.json`) are plain
JSON committed to this repo — commit and push to sync between machines.

Design: `docs/specs/2026-07-17-course-dashboard-design.md`.
Plan: `docs/plans/2026-07-17-course-dashboard.md`.
```
(Remove the zero-width characters around the code fence when writing the file — they exist only so this plan's own fence doesn't break.)

- [ ] **Step 2: Full verification pass**

Run: `npm test`
Expected: all suites pass.

Run: `npm run build`
Expected: clean build.

Run: `npm run dev` and click through: `/` (check an item from Week 0 via `/weeks/week-00`, log a session, watch streak + heatmap), `/course` (week links navigate to `/weeks/week-NN`), `/reference`, `/weeks/week-12`.
Expected: everything renders, mutations persist across reload.

Corrupt-file drill: `echo '{ bad' > data/progress.json`, reload `/` → red banner appears; checking a box on a week page shows the 409 alert and does not overwrite the file. Restore: `git checkout -- data/progress.json`.

- [ ] **Step 3: Commit**

```bash
git add app/course/ app/reference/ README.md
git commit -m "feat: add course map and reference pages; project README"
```
