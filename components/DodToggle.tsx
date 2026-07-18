'use client'
import { useRouter } from 'next/navigation'

export default function DodToggle({ weekId, done }: { weekId: string; done: boolean }) {
  const router = useRouter()

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekId, done: e.target.checked }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert(body.error ?? 'failed to save')
      return
    }
    router.refresh()
  }

  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" checked={done} onChange={onChange} />
      Definition of done met
    </label>
  )
}
