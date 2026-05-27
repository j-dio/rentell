export default function HousingLoading() {
  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>

      {/* Filter panel skeleton */}
      <div className="w-full h-28 bg-muted rounded-2xl" />

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border overflow-hidden">
            <div className="h-48 bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
