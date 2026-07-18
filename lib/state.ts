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
