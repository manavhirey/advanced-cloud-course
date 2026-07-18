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
