export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted rounded-lg" />
          <div className="h-3 w-48 bg-muted rounded" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-md" />
      </div>

      {/* Listing card skeletons */}
      <ul className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="border border-border rounded-lg p-4 flex items-center gap-4">
            <div className="w-20 h-20 bg-muted rounded-md shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-3 w-1/4 bg-muted rounded" />
              <div className="h-3 w-1/3 bg-muted rounded" />
              <div className="h-3 w-2/5 bg-muted rounded" />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-7 w-16 bg-muted rounded-md" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
