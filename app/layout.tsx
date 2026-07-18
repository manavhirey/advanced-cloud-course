import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = { title: 'Advanced Cloud Course' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <nav className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
            <Link href="/" className="font-semibold">☁️ Advanced Cloud Course</Link>
            <Link href="/course" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">Course map</Link>
            <Link href="/reference" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">Reference</Link>
          </div>
        </nav>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
