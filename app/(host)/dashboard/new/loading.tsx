export default function NewListingLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="h-3 w-28 bg-muted rounded" />
        <div className="h-8 w-36 bg-muted rounded-lg" />
      </div>

      {/* Form fields */}
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-10 bg-muted rounded-md" />
          </div>
        ))}

        {/* Price grid */}
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-10 bg-muted rounded-md" />
            </div>
          ))}
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-24 bg-muted rounded-md" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-28 bg-muted rounded-md" />
          <div className="h-10 w-20 bg-muted rounded-md" />
        </div>
      </div>
    </main>
  )
}
