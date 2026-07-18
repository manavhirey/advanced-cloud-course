export default function CorruptBanner({ corrupt }: { corrupt: { progress: boolean; sessions: boolean } }) {
  const files = [corrupt.progress && 'data/progress.json', corrupt.sessions && 'data/sessions.json'].filter(Boolean)
  if (files.length === 0) return null
  return (
    <div className="console-panel mb-8 border-l-2 border-l-crit p-4">
      <p className="eyebrow text-crit">data error</p>
      <p className="mt-1.5 text-sm text-foam">
        <code className="font-mono text-[13px]">{files.join(', ')}</code> can’t be read. Fix or delete the file — saving
        stays off until it parses.
      </p>
    </div>
  )
}
