export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 animate-pulse">
      <div className="h-8 w-36 bg-muted rounded-lg" />

      {/* Account section */}
      <div className="border rounded-lg p-6 space-y-3">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-32 bg-muted rounded shrink-0" />
              <div className="h-4 flex-1 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Student info section */}
      <div className="border rounded-lg p-6 space-y-3">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-32 bg-muted rounded shrink-0" />
              <div className="h-4 flex-1 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Host status section */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
        <div className="h-9 w-36 bg-muted rounded-md" />
      </div>
    </div>
  )
}
