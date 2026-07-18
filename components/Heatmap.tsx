import type { HeatCell } from '@/lib/streaks'

const colors = [
  'bg-neutral-200 dark:bg-neutral-800',
  'bg-emerald-200',
  'bg-emerald-400',
  'bg-emerald-600',
  'bg-emerald-800',
]

export default function Heatmap({ cells }: { cells: HeatCell[] }) {
  const cols: HeatCell[][] = []
  for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7))
  return (
    <div className="flex gap-1 overflow-x-auto">
      {cols.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-1">
          {col.map(c => (
            <div key={c.date} title={c.date} className={`h-3 w-3 rounded-sm ${colors[c.level]}`} />
          ))}
        </div>
      ))}
    </div>
  )
}
