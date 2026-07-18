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
