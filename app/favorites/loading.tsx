export default function FavoritesLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      {/* Title */}
      <div className="h-8 w-44 bg-muted rounded-lg mb-8" />

      {/* List skeletons */}
      <ul className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="border border-border rounded-lg p-4 flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-16 bg-muted rounded-full" />
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
            <div className="h-4 w-12 bg-muted rounded shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  )
}
