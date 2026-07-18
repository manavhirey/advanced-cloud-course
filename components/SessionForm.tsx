'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const field =
  'block w-full rounded-md border border-hairline bg-abyss px-2.5 py-1.5 text-sm text-foam placeholder:text-fog/60 focus:border-accent focus:outline-none'

export default function SessionForm({ weeks }: { weeks: { id: string; title: string }[] }) {
  const router = useRouter()
  const [minutes, setMinutes] = useState('30')
  const [weekId, setWeekId] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes: Number(minutes), weekId: weekId || undefined, note: note || undefined }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'failed to log session')
      return
    }
    setNote('')
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2.5">
      <label className="font-mono text-[11px] uppercase tracking-wider text-fog">
        minutes
        <input type="number" min="1" value={minutes} onChange={e => setMinutes(e.target.value)}
          className={`${field} mt-1 w-24 font-mono tabular-nums`} />
      </label>
      <label className="font-mono text-[11px] uppercase tracking-wider text-fog">
        week
        <select value={weekId} onChange={e => setWeekId(e.target.value)} className={`${field} mt-1 w-44`}>
          <option value="">—</option>
          {weeks.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
        </select>
      </label>
      <label className="min-w-40 flex-1 font-mono text-[11px] uppercase tracking-wider text-fog">
        note
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="optional" className={`${field} mt-1`} />
      </label>
      <button
        type="submit"
        className="rounded-md bg-accent px-3.5 py-1.5 text-sm font-medium text-abyss transition-colors hover:bg-[#7AA2FF]"
      >
        Log session
      </button>
      {error && <p className="w-full text-sm text-crit">{error}</p>}
    </form>
  )
}
