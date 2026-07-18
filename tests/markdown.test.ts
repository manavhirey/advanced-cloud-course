import { describe, it, expect } from 'vitest'
import { renderMarkdown, renderWeekHtml, rewriteCourseLinks } from '@/lib/markdown'
import type { ManifestItem, Progress } from '@/lib/types'

const MD = `# Title

- [ ] first item
- [ ] second item
`
const items: ManifestItem[] = [
  { id: 'week-00:0:aaaaaaaa', weekId: 'week-00', index: 0, text: 'first item' },
  { id: 'week-00:1:bbbbbbbb', weekId: 'week-00', index: 1, text: 'second item' },
]

describe('renderWeekHtml', () => {
  it('tags every checkbox with its manifest item id in order', () => {
    const html = renderWeekHtml(MD, items, { items: {}, weeks: {} })
    const idsInOrder = [...html.matchAll(/data-item-id="([^"]+)"/g)].map(m => m[1])
    expect(idsInOrder).toEqual(['week-00:0:aaaaaaaa', 'week-00:1:bbbbbbbb'])
    expect(html).not.toContain('disabled')
  })
  it('marks done items checked', () => {
    const progress: Progress = { items: { 'week-00:1:bbbbbbbb': { done: true, at: 'x' } }, weeks: {} }
    const html = renderWeekHtml(MD, items, progress)
    expect(html).toContain('data-item-id="week-00:1:bbbbbbbb" checked')
    expect(html).not.toContain('data-item-id="week-00:0:aaaaaaaa" checked')
  })
})

describe('renderMarkdown', () => {
  it('renders headings and links', () => {
    const html = renderMarkdown('# H\n\n[x](https://example.com)')
    expect(html).toContain('<h1')
    expect(html).toContain('href="https://example.com"')
  })
})

describe('rewriteCourseLinks', () => {
  it('rewrites week and reference links to app routes', () => {
    const html = '<a href="weeks/week-06-eks.md">w</a> <a href="reference/worked-repos.md">r</a>'
    expect(rewriteCourseLinks(html)).toBe('<a href="/weeks/week-06">w</a> <a href="/reference">r</a>')
  })
})
