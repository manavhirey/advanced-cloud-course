import SetupNotice from '@/components/SetupNotice'
import { renderMarkdown } from '@/lib/markdown'
import { readContent } from '@/lib/state'

export const dynamic = 'force-dynamic'

export default function ReferencePage() {
  const md = readContent('reference.md')
  if (!md) return <SetupNotice />
  return <article className="prose prose-neutral max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />
}
