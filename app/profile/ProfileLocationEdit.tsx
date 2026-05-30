'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import MapboxLocationPicker, { type PickedLocation } from '@/components/MapboxLocationPicker'

type Props = { initialLocation?: PickedLocation }

export default function ProfileLocationEdit({ initialLocation }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm(loc: PickedLocation) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profile/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferred_location_name: loc.name,
          preferred_location_lat: loc.lat,
          preferred_location_lng: loc.lng,
        }),
      })
      if (!res.ok) { setError('Failed to save. Please try again.'); return }
      setEditing(false)
      router.refresh()
    } catch {
      setError('Network error.')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <MapboxLocationPicker
          onConfirm={handleConfirm}
          initialLocation={initialLocation}
          confirmLabel={saving ? 'Saving…' : 'Save location'}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {initialLocation ? (
        <p className="text-sm text-foreground">{initialLocation.name}</p>
      ) : (
        <p className="text-sm text-muted-foreground">No location set yet.</p>
      )}
      <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
        {initialLocation ? 'Edit location' : 'Set location'}
      </Button>
    </div>
  )
}
