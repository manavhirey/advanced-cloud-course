'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <label className="text-sm">
        Minutes
        <input type="number" min="1" value={minutes} onChange={e => setMinutes(e.target.value)}
          className="mt-1 block w-24 rounded border border-neutral-300 bg-transparent px-2 py-1 dark:border-neutral-700" />
      </label>
      <label className="text-sm">
        Week
        <select value={weekId} onChange={e => setWeekId(e.target.value)}
          className="mt-1 block rounded border border-neutral-300 bg-transparent px-2 py-1 dark:border-neutral-700 dark:bg-neutral-950">
          <option value="">—</option>
          {weeks.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
        </select>
      </label>
      <label className="text-sm">
        Note
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="optional"
          className="mt-1 block w-48 rounded border border-neutral-300 bg-transparent px-2 py-1 dark:border-neutral-700" />
      </label>
      <button type="submit" className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700">
        Log session
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  )
}
