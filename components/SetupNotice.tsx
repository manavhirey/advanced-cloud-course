export default function SetupNotice() {
  return (
    <div className="console-panel mx-auto mt-16 max-w-md p-6 text-center">
      <p className="eyebrow">no course content</p>
      <p className="mt-3 text-sm text-fog">Ingest the course docs, then reload this page.</p>
      <code className="mt-4 block rounded-md border border-hairline bg-abyss px-4 py-2.5 font-mono text-sm text-foam">
        <span className="text-fog">$</span> npm run ingest
      </code>
    </div>
  )
}
