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
