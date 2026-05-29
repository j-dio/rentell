export default function MessagesLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 w-32 bg-muted rounded-lg mb-8" />

      <ul className="border rounded-lg overflow-hidden divide-y">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-muted" />

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <div className="h-4 w-36 bg-muted rounded" />
                <div className="h-3 w-10 bg-muted rounded shrink-0" />
              </div>
              <div className="h-3 w-48 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
