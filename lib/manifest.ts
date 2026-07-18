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
    const assigned = new Set<string>()
    for (const item of week.items) {
      const h = item.id.split(':')[2]
      const match = prevWeek.items.find(p => p.id.split(':')[2] === h && !claimed.has(p.id))
      if (match) {
        claimed.add(match.id)
        item.id = match.id
      }
      if (assigned.has(item.id)) {
        let n = item.index
        let candidate: string
        do {
          n += 1
          candidate = `${item.weekId}:${n}:${h}`
        } while (assigned.has(candidate))
        item.id = candidate
      }
      assigned.add(item.id)
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
