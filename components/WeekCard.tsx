import Link from 'next/link'
import { weekStatus } from '@/lib/state'
import type { ManifestWeek, Progress } from '@/lib/types'

// column template shared with the table header in app/page.tsx
export const weekRowGrid = 'sm:grid-cols-[6rem_minmax(0,1fr)_6.5rem_4rem_7.5rem]'

const phase = {
  notStarted: { label: 'Pending', dot: 'bg-fog/50', text: 'text-fog' },
  inProgress: { label: 'Running', dot: 'bg-warn', text: 'text-warn' },
  done: { label: 'Complete', dot: 'bg-ok', text: 'text-ok' },
}

export default function WeekCard({ week, progress }: { week: ManifestWeek; progress: Progress }) {
  const status = weekStatus(week, progress)
  const p = phase[status]
  const done = week.items.filter(i => progress.items[i.id]?.done).length
  const pct = week.items.length > 0 ? Math.round((done / week.items.length) * 100) : 0
  const title = week.title.replace(/^Week \d+\s*[—-]\s*/, '')

  return (
    <Link
      href={`/weeks/${week.id}`}
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 border-t border-hairline px-4 py-3 transition-colors hover:bg-raise ${weekRowGrid}`}
    >
      <span className="font-mono text-[13px] text-fog">{week.id}</span>
      <span className="truncate text-sm text-foam" title={title}>{title}</span>
      <span className={`flex items-center gap-1.5 font-mono text-xs ${p.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
        {p.label}
      </span>
      <span className="hidden font-mono text-xs tabular-nums text-fog sm:block">
        {done}/{week.items.length}
      </span>
      <span className="hidden h-1 overflow-hidden rounded-full bg-trench sm:block">
        <span
          className={`block h-full rounded-full ${status === 'done' ? 'bg-ok' : 'bg-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </span>
    </Link>
  )
}
