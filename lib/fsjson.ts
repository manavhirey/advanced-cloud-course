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
