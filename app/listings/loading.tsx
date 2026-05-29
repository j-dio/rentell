export default function ListingsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-12 animate-pulse">
      {/* Page header */}
      <div>
        <div className="h-8 w-36 bg-muted rounded-lg" />
        <div className="h-4 w-64 bg-muted rounded mt-1.5" />
      </div>

      {/* Housing listings section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-3 w-56 bg-muted rounded mt-1.5" />
          </div>
          <div className="h-9 w-32 bg-muted rounded-md" />
        </div>

        <ul className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="border rounded-lg p-4 flex items-center gap-4">
              <div className="w-[72px] h-[72px] rounded-md bg-muted shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-3 w-40 bg-muted rounded" />
                <div className="h-3 w-28 bg-muted rounded" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-8 w-8 bg-muted rounded-md" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Carinderia listings section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-5 w-44 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded mt-1.5" />
          </div>
          <div className="h-9 w-36 bg-muted rounded-md" />
        </div>

        <ul className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="border rounded-lg p-4 flex items-center gap-4">
              <div className="w-[72px] h-[72px] rounded-md bg-muted shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="h-4 w-44 bg-muted rounded" />
                <div className="h-3 w-36 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-8 w-8 bg-muted rounded-md" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
