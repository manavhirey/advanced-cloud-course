import type { HeatCell } from '@/lib/streaks'

const colors = ['bg-trench', 'bg-ok/25', 'bg-ok/50', 'bg-ok/75', 'bg-ok']

export default function Heatmap({ cells }: { cells: HeatCell[] }) {
  const cols: HeatCell[][] = []
  for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7))
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map(c => (
              <div key={c.date} title={c.date} className={`h-3 w-3 rounded-[3px] ${colors[c.level]}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-fog">
        less
        {colors.map(c => (
          <span key={c} className={`h-2.5 w-2.5 rounded-[3px] ${c}`} />
        ))}
        more
      </div>
    </div>
  )
}
