import Link from 'next/link'
import { notFound } from 'next/navigation'
import CorruptBanner from '@/components/CorruptBanner'
import DodToggle from '@/components/DodToggle'
import SetupNotice from '@/components/SetupNotice'
import WeekContent from '@/components/WeekContent'
import { renderWeekHtml } from '@/lib/markdown'
import { loadState, readContent } from '@/lib/state'

export const dynamic = 'force-dynamic'

export default async function WeekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { manifest, progress, corrupt } = loadState()
  if (!manifest) return <SetupNotice />
  const week = manifest.weeks.find(w => w.id === id)
  if (!week) notFound()
  const md = readContent(`weeks/${week.file}`)
  if (!md) return <SetupNotice />

  const idx = manifest.weeks.findIndex(w => w.id === id)
  const prev = manifest.weeks[idx - 1]
  const next = manifest.weeks[idx + 1]

  return (
    <div>
      <CorruptBanner corrupt={corrupt} />
      <div className="mb-6 flex items-center justify-between text-sm">
        {prev ? <Link href={`/weeks/${prev.id}`} className="text-neutral-500 hover:underline">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/weeks/${next.id}`} className="text-neutral-500 hover:underline">{next.title} →</Link> : <span />}
      </div>
      <WeekContent html={renderWeekHtml(md, week.items, progress)} />
      {week.dod !== null && (
        <div className="mt-8 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700">
          <DodToggle weekId={week.id} done={!!progress.weeks[week.id]?.dodDone} />
        </div>
      )}
    </div>
  )
}
