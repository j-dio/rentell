export default function ThreadLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex flex-col h-[calc(100vh-var(--site-header-height)-2rem)] animate-pulse">

        {/* Thread header */}
        <div className="border-b pb-4 mb-4 space-y-1.5">
          <div className="h-7 w-44 bg-muted rounded" />
          <div className="h-4 w-56 bg-muted rounded" />
        </div>

        {/* Message bubbles */}
        <div className="flex-1 overflow-hidden space-y-3 pr-1">
          <div className="flex justify-start">
            <div className="h-10 w-52 bg-muted rounded-xl" />
          </div>
          <div className="flex justify-end">
            <div className="h-10 w-44 bg-primary/20 rounded-xl" />
          </div>
          <div className="flex justify-start">
            <div className="h-14 w-64 bg-muted rounded-xl" />
          </div>
          <div className="flex justify-end">
            <div className="h-10 w-36 bg-primary/20 rounded-xl" />
          </div>
          <div className="flex justify-start">
            <div className="h-10 w-48 bg-muted rounded-xl" />
          </div>
        </div>

        {/* Send form */}
        <div className="border-t pt-4 mt-4 flex gap-2 items-end">
          <div className="flex-1 h-16 bg-muted rounded-md" />
          <div className="h-9 w-16 bg-muted rounded-md shrink-0" />
        </div>

      </div>
    </div>
  )
}
