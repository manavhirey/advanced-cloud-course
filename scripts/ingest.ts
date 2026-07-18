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
