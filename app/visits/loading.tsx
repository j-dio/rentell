export default function VisitsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      {/* Title */}
      <div className="h-8 w-52 bg-muted rounded-lg mb-8" />

      {/* List skeletons */}
      <ul className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-3 w-40 bg-muted rounded" />
              </div>
              <div className="h-5 w-16 bg-muted rounded-full shrink-0" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
