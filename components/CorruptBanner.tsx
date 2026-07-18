export default function CorruptBanner({ corrupt }: { corrupt: { progress: boolean; sessions: boolean } }) {
  const files = [corrupt.progress && 'data/progress.json', corrupt.sessions && 'data/sessions.json'].filter(Boolean)
  if (files.length === 0) return null
  return (
    <div className="mb-6 rounded border border-red-400 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
      {files.join(' and ')} unreadable — fix or delete the file(s). Saving is disabled for corrupt files.
    </div>
  )
}
