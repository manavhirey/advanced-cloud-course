import Link from 'next/link'
import { weekStatus } from '@/lib/state'
import type { ManifestWeek, Progress } from '@/lib/types'

const badge = {
  notStarted: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  inProgress: 'bg-amber-200 text-amber-900',
  done: 'bg-emerald-200 text-emerald-900',
}
const label = { notStarted: 'Not started', inProgress: 'In progress', done: 'Done' }

export default function WeekCard({ week, progress }: { week: ManifestWeek; progress: Progress }) {
  const status = weekStatus(week, progress)
  const done = week.items.filter(i => progress.items[i.id]?.done).length
  const pct = week.items.length > 0 ? Math.round((done / week.items.length) * 100) : 0
  return (
    <Link href={`/weeks/${week.id}`} className="block rounded-lg border border-neutral-300 p-4 hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-400">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{week.title}</h3>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs ${badge[status]}`}>{label[status]}</span>
      </div>
      <div className="mt-3 h-2 rounded bg-neutral-200 dark:bg-neutral-800">
        <div className="h-2 rounded bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-neutral-500">{done}/{week.items.length} tasks</p>
    </Link>
  )
}
