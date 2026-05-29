export default function ManageListingLoading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-12 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-8 w-56 bg-muted rounded-lg" />
          <div className="h-3 w-48 bg-muted rounded" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-4 w-28 bg-muted rounded" />
        </div>
      </div>

      {/* Sections */}
      {Array.from({ length: 5 }).map((_, i) => (
        <section key={i} className="space-y-4">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-20 bg-muted rounded-lg" />
          <div className="h-10 w-40 bg-muted rounded-lg" />
        </section>
      ))}
    </main>
  )
}
