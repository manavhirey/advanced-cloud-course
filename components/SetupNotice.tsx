export default function SetupNotice() {
  return (
    <div className="rounded border border-amber-400 bg-amber-50 p-4 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      <p className="font-medium">No course content found.</p>
      <p className="mt-1 text-sm">Run <code>npm run ingest</code> from the project root, then reload.</p>
    </div>
  )
}
