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
  it('never mints duplicate ids when two items share text and hash', () => {
    const prevMd = `# Week 1

- [ ] alpha
- [ ] foo
`
    const nextMd = `# Week 1

- [ ] foo
- [ ] foo
`
    const prev: Manifest = { generatedAt: 't', weeks: [parseWeekFile('week-01-x.md', prevMd, 1)], extras: [] }
    const next: Manifest = { generatedAt: 't', weeks: [parseWeekFile('week-01-x.md', nextMd, 1)], extras: [] }
    const { manifest } = mergeManifest(prev, next)
    const ids = manifest.weeks[0].items.map(i => i.id)
    expect(ids[0]).not.toBe(ids[1])
    expect(new Set(ids).size).toBe(2)
    expect(ids).toContain(prev.weeks[0].items[1].id)
  })
})
