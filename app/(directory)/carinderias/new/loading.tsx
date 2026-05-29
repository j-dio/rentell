export default function NewCarinderiaLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      {/* Back link + title */}
      <div className="mb-2">
        <div className="h-4 w-36 bg-muted rounded" />
        <div className="h-8 w-52 bg-muted rounded-lg mt-3" />
      </div>

      {/* Step indicator — 2 steps */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-muted" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
        <div className="h-4 w-2 bg-muted rounded" />
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-muted" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-14 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded-md" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded-md" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-24 w-full bg-muted rounded-md" />
        </div>

        <div className="flex gap-3 pt-2">
          <div className="h-10 w-40 bg-muted rounded-md" />
          <div className="h-10 w-20 bg-muted rounded-md" />
        </div>
      </div>
    </div>
  )
}
