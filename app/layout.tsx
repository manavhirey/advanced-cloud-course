import type { Metadata } from 'next'
import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'advanced-cloud-course',
  description: 'Control plane for the self-paced Advanced Cloud Computing course',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body className="min-h-screen">
        <nav className="sticky top-0 z-10 border-b border-hairline bg-abyss/85 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-baseline gap-6 px-4 py-3">
            <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
              <span className="text-accent">⎈</span> advanced-cloud-course
            </Link>
            <div className="ml-auto flex items-baseline gap-5">
              <Link href="/course" className="font-mono text-xs text-fog transition-colors hover:text-foam">course map</Link>
              <Link href="/reference" className="font-mono text-xs text-fog transition-colors hover:text-foam">reference</Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-4xl px-4 py-10">{children}</main>
      </body>
    </html>
  )
}
