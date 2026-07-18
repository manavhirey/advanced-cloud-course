import { marked } from 'marked'
import type { ManifestItem, Progress } from './types'

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false, gfm: true }) as string
}

// marked 12.0.2 renders task-list checkboxes as:
//   <input checked="" disabled="" type="checkbox"> or <input disabled="" type="checkbox">
// The version is pinned exactly because this regex depends on that output.
const CHECKBOX_RE = /<input (?:checked="" )?disabled="" type="checkbox">/g

export function renderWeekHtml(md: string, items: ManifestItem[], progress: Progress): string {
  let i = 0
  return renderMarkdown(md).replace(CHECKBOX_RE, () => {
    const item = items[i++]
    if (!item) return '<input type="checkbox">'
    const checked = progress.items[item.id]?.done ? ' checked' : ''
    return `<input type="checkbox" data-item-id="${item.id}"${checked}>`
  })
}

export function rewriteCourseLinks(html: string): string {
  return html
    .replace(/href="weeks\/(week-\d{2})[^"]*"/g, 'href="/weeks/$1"')
    .replace(/href="reference\/worked-repos\.md"/g, 'href="/reference"')
}
