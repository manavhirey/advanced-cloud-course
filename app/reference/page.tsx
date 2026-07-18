import SetupNotice from '@/components/SetupNotice'
import { renderMarkdown } from '@/lib/markdown'
import { readContent } from '@/lib/state'

export const dynamic = 'force-dynamic'

export default function ReferencePage() {
  const md = readContent('reference.md')
  if (!md) return <SetupNotice />
  return (
    <div>
      <p className="eyebrow mb-6">reference · prior worked repos</p>
      <article className="prose-console" dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />
    </div>
  )
}
