import Link from 'next/link'
import CorruptBanner from '@/components/CorruptBanner'
import Heatmap from '@/components/Heatmap'
import SessionForm from '@/components/SessionForm'
import SetupNotice from '@/components/SetupNotice'
import WeekCard, { weekRowGrid } from '@/components/WeekCard'
import { loadState, weekStatus } from '@/lib/state'
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
  const streak = currentStreak(days, today)

  const statuses = manifest.weeks.map(w => weekStatus(w, progress))
  const currentIdx = statuses.findIndex(s => s !== 'done')
  const current = currentIdx >= 0 ? manifest.weeks[currentIdx] : null
  const currentDone = current ? current.items.filter(i => progress.items[i.id]?.done).length : 0
  const verb = currentIdx >= 0 && statuses[currentIdx] === 'inProgress' ? 'Continue' : 'Start'

  return (
    <div>
      <CorruptBanner corrupt={corrupt} />

      {/* hero: where you are */}
      <header className="anim-rise">
        <p className="eyebrow">advanced cloud computing · 13 weeks · self-paced</p>
        {current ? (
          <>
            <h1 className="mt-3 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
              <span className="text-accent">{current.id}</span>
              <span className="mx-3 text-fog">/</span>
              {current.title.replace(/^Week \d+\s*[—-]\s*/, '')}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href={`/weeks/${current.id}`}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-abyss transition-colors hover:bg-[#7AA2FF]"
              >
                {verb} week {currentIdx} →
              </Link>
              <p className="font-mono text-xs text-fog">
                {currentDone}/{current.items.length} tasks this week · {pct}% of course · {doneItems}/{totalItems} overall
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-3 font-mono text-2xl font-semibold tracking-tight text-ok sm:text-3xl">
              All 13 weeks complete
            </h1>
            <p className="mt-2 font-mono text-xs text-fog">{doneItems}/{totalItems} tasks · course finished</p>
          </>
        )}

        {/* pipeline: one segment per week */}
        <div className="mt-7 flex gap-1" aria-hidden>
          {manifest.weeks.map((w, i) => {
            const s = statuses[i]
            const color = s === 'done' ? 'bg-ok' : i === currentIdx ? 'bg-accent' : s === 'inProgress' ? 'bg-warn' : 'bg-trench'
            const tall = i === currentIdx ? 'h-2.5' : 'h-1.5'
            return (
              <span key={w.id} className="flex flex-1 flex-col justify-center">
                <span className={`anim-seg block rounded-full ${tall} ${color}`} style={{ animationDelay: `${i * 40}ms` }} />
              </span>
            )
          })}
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-fog/70">
          <span>week-00</span>
          <span>week-12</span>
        </div>
      </header>

      {/* observability row */}
      <section className="anim-rise mt-10 grid gap-4 sm:grid-cols-[15rem_minmax(0,1fr)]" style={{ animationDelay: '90ms' }}>
        <div className="console-panel p-5">
          <p className="eyebrow">consistency</p>
          <p className="mt-3 font-mono text-4xl font-semibold tabular-nums">
            {streak}<span className="ml-1 text-base font-normal text-fog">d</span>
          </p>
          <p className="mt-1 text-sm text-fog">current streak</p>
          <p className="mt-4 border-t border-hairline pt-3 font-mono text-xs text-fog">
            best {longestStreak(days)}d · {days.size} active days
          </p>
        </div>
        <div className="console-panel p-5">
          <p className="eyebrow">activity · last 17 weeks</p>
          <div className="mt-3">
            <Heatmap cells={cells} />
          </div>
          <div className="mt-4 border-t border-hairline pt-4">
            <SessionForm weeks={manifest.weeks.map(w => ({ id: w.id, title: w.title }))} />
          </div>
        </div>
      </section>

      {/* signature: the course as a workload table */}
      <section className="anim-rise console-panel mt-10 overflow-hidden" style={{ animationDelay: '180ms' }}>
        <div className="flex items-baseline justify-between px-4 py-3">
          <p className="font-mono text-[13px] text-fog">
            <span className="text-fog/60">$</span> <span className="text-foam">kubectl get weeks</span>
          </p>
          <p className="font-mono text-[11px] text-fog/70">{manifest.weeks.length} items</p>
        </div>
        <div className={`hidden border-t border-hairline px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-fog/70 sm:grid ${weekRowGrid} gap-x-4`}>
          <span>name</span>
          <span>title</span>
          <span>status</span>
          <span>tasks</span>
          <span>ready</span>
        </div>
        {manifest.weeks.map(w => <WeekCard key={w.id} week={w} progress={progress} />)}
      </section>
    </div>
  )
}
