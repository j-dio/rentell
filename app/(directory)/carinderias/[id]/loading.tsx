export default function CarinderiaDetailLoading() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-muted rounded-lg" />
          <div className="h-3 w-40 bg-muted rounded" />
        </div>
        <div className="h-6 w-16 bg-muted rounded" />
      </div>

      {/* Image gallery */}
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 h-60 bg-muted rounded-xl" />
        <div className="flex flex-col gap-2">
          <div className="flex-1 bg-muted rounded-xl" />
          <div className="flex-1 bg-muted rounded-xl" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-5 w-20 bg-muted rounded" />
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-5/6 bg-muted rounded" />
        <div className="h-3 w-4/6 bg-muted rounded" />
      </div>

      {/* Reviews */}
      <div className="space-y-3">
        <div className="h-5 w-20 bg-muted rounded" />
        <div className="h-24 bg-muted rounded-lg" />
        <div className="h-24 bg-muted rounded-lg" />
      </div>
    </main>
  )
}
