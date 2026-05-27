export default function OwnerVisitsLoading() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 animate-pulse">
      {/* Back link */}
      <div className="h-3 w-28 bg-muted rounded" />

      {/* Title */}
      <div className="h-8 w-64 bg-muted rounded-lg" />

      {/* Section */}
      <div className="space-y-3">
        <div className="h-4 w-24 bg-muted rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-muted rounded" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
              <div className="h-5 w-16 bg-muted rounded-full" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-muted rounded-md" />
              <div className="h-8 w-20 bg-muted rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
