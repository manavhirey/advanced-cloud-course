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
