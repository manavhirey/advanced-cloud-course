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
