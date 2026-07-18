import CorruptBanner from '@/components/CorruptBanner'
import Heatmap from '@/components/Heatmap'
import SessionForm from '@/components/SessionForm'
import SetupNotice from '@/components/SetupNotice'
import WeekCard from '@/components/WeekCard'
import { loadState } from '@/lib/state'
import { activeDays, addDays, currentStreak, heatmapCells, longestStreak, minutesByDay, todayYMD } from '@/lib/streaks'

export const dynamic = 'force-dynamic'

export default function Dashboard() {
  const { manifest, progress, sessions, corrupt } = loadState()
  if (!manifest) return <SetupNotice />

  const totalItems = manifest.weeks.reduce((n, w) => n + w.items.length, 0)
  const doneItems = manifest.weeks.reduce((n, w) => n + w.items.filter(i => progress.items[i.id]?.done).length, 0)
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0

  const days = activeDays(progress, sessions)
  const today = todayYMD()
  const cells = heatmapCells(days, minutesByDay(sessions), addDays(today, -118), today)

  return (
    <div>
      <CorruptBanner corrupt={corrupt} />
      <section className="flex flex-wrap items-center gap-8">
        <div>
          <p className="text-4xl font-bold">{pct}%</p>
          <p className="text-sm text-neutral-500">{doneItems}/{totalItems} tasks done</p>
        </div>
        <div>
          <p className="text-4xl font-bold">{currentStreak(days, today)}<span className="text-base font-normal"> days</span></p>
          <p className="text-sm text-neutral-500">current streak (longest {longestStreak(days)})</p>
        </div>
      </section>
      <section className="mt-6">
        <Heatmap cells={cells} />
      </section>
      <section className="mt-8 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">Log a study session</h2>
        <SessionForm weeks={manifest.weeks.map(w => ({ id: w.id, title: w.title }))} />
      </section>
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {manifest.weeks.map(w => <WeekCard key={w.id} week={w} progress={progress} />)}
      </section>
    </div>
  )
}
