import Link from 'next/link'
import { notFound } from 'next/navigation'
import CorruptBanner from '@/components/CorruptBanner'
import DodToggle from '@/components/DodToggle'
import SetupNotice from '@/components/SetupNotice'
import WeekContent from '@/components/WeekContent'
import { renderWeekHtml } from '@/lib/markdown'
import { loadState, readContent, weekStatus } from '@/lib/state'

export const dynamic = 'force-dynamic'

const phase = {
  notStarted: { label: 'Pending', text: 'text-fog' },
  inProgress: { label: 'Running', text: 'text-warn' },
  done: { label: 'Complete', text: 'text-ok' },
}

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
  const done = week.items.filter(i => progress.items[i.id]?.done).length
  const p = phase[weekStatus(week, progress)]

  return (
    <div>
      <CorruptBanner corrupt={corrupt} />

      <header className="mb-8 border-b border-hairline pb-5">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="eyebrow">
            week {String(idx).padStart(2, '0')} / 12
          </p>
          <p className={`font-mono text-xs ${p.text}`}>● {p.label}</p>
          <p className="font-mono text-xs text-fog">{done}/{week.items.length} tasks</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 font-mono text-xs">
          {prev ? (
            <Link href={`/weeks/${prev.id}`} className="text-fog transition-colors hover:text-foam">← {prev.id}</Link>
          ) : <span />}
          {next ? (
            <Link href={`/weeks/${next.id}`} className="text-fog transition-colors hover:text-foam">{next.id} →</Link>
          ) : <span />}
        </div>
      </header>

      <WeekContent html={renderWeekHtml(md, week.items, progress)} />

      {week.dod !== null && (
        <div className="console-panel mt-10 border-l-2 border-l-accent p-5">
          <p className="eyebrow mb-3">exit criteria</p>
          <DodToggle weekId={week.id} done={!!progress.weeks[week.id]?.dodDone} />
        </div>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-hairline pt-5 font-mono text-xs">
        {prev ? (
          <Link href={`/weeks/${prev.id}`} className="text-fog transition-colors hover:text-foam">← {prev.id}</Link>
        ) : <span />}
        {next ? (
          <Link href={`/weeks/${next.id}`} className="text-fog transition-colors hover:text-foam">{next.id} →</Link>
        ) : <span />}
      </div>
    </div>
  )
}
