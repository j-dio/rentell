'use client'

import { useState } from 'react'

type Props = {
  housingId: number
  allAmenities: string[]
  taggedAmenities: string[]
}

export default function AmenityTagForm({ housingId, allAmenities, taggedAmenities }: Props) {
  // Local state tracks what's tagged so the UI stays current without a server round-trip.
  // Initialised from the server-fetched prop; updated optimistically on each toggle.
  const [tagged, setTagged] = useState<Set<string>>(() => new Set(taggedAmenities))
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const available = allAmenities.filter((a) => !tagged.has(a))
  const taggedList = allAmenities.filter((a) => tagged.has(a))

  async function toggle(amenityName: string, isTagged: boolean) {
    setPending(amenityName)
    setError(null)

    // Optimistic update
    setTagged((prev) => {
      const next = new Set(prev)
      isTagged ? next.delete(amenityName) : next.add(amenityName)
      return next
    })

    try {
      const res = await fetch(`/api/host/housing/${housingId}/amenities`, {
        method: isTagged ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amenity_name: amenityName }),
      })
      if (!res.ok) {
        // Revert optimistic update on failure
        setTagged((prev) => {
          const next = new Set(prev)
          isTagged ? next.add(amenityName) : next.delete(amenityName)
          return next
        })
        const data = await res.json()
        setError(data.error ?? 'Failed to update amenity')
      }
    } catch {
      // Revert optimistic update on network error
      setTagged((prev) => {
        const next = new Set(prev)
        isTagged ? next.add(amenityName) : next.delete(amenityName)
        return next
      })
      setError('Network error. Please try again.')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {taggedList.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tagged
          </p>
          <div className="flex flex-wrap gap-2">
            {taggedList.map((a) => (
              <button
                key={a}
                type="button"
                disabled={pending === a}
                onClick={() => toggle(a, true)}
                className="text-sm bg-primary/10 text-primary border border-primary/30 px-3 py-1 rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Remove "${a}"`}
              >
                {pending === a ? '…' : `${a} ✕`}
              </button>
            ))}
          </div>
        </div>
      )}

      {available.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Available to tag
          </p>
          <div className="flex flex-wrap gap-2">
            {available.map((a) => (
              <button
                key={a}
                type="button"
                disabled={pending === a}
                onClick={() => toggle(a, false)}
                className="text-sm border px-3 py-1 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={`Tag "${a}"`}
              >
                {pending === a ? '…' : `+ ${a}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {taggedList.length === 0 && available.length === 0 && (
        <p className="text-sm text-muted-foreground">No amenities available.</p>
      )}
    </div>
  )
}
