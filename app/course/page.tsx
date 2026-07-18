import SetupNotice from '@/components/SetupNotice'
import { renderMarkdown, rewriteCourseLinks } from '@/lib/markdown'
import { readContent } from '@/lib/state'

export const dynamic = 'force-dynamic'

export default function CoursePage() {
  const md = readContent('README.md')
  if (!md) return <SetupNotice />
  const html = rewriteCourseLinks(renderMarkdown(md))
  return <article className="prose prose-neutral max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
}
