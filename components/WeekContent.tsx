'use client'
import { useRouter } from 'next/navigation'

export default function WeekContent({ html }: { html: string }) {
  const router = useRouter()

  async function onClick(e: React.MouseEvent) {
    const t = e.target as HTMLElement
    if (!(t instanceof HTMLInputElement) || t.type !== 'checkbox' || !t.dataset.itemId) return
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: t.dataset.itemId, done: t.checked }),
    })
    if (!res.ok) {
      t.checked = !t.checked
      const body = await res.json().catch(() => ({}))
      alert(body.error ?? 'failed to save')
      return
    }
    router.refresh()
  }

  return (
    <article
      onClick={onClick}
      className="prose prose-neutral max-w-none dark:prose-invert prose-li:my-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
