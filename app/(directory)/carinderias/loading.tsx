export default function CarinderiasLoading() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8 animate-pulse">
      {/* Title */}
      <div className="h-8 w-36 bg-muted rounded-lg mb-6" />

      {/* Search bar */}
      <div className="h-10 max-w-lg bg-muted rounded-lg mb-6" />

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border overflow-hidden">
            <div className="h-44 bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
              <div className="h-3 w-1/3 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
