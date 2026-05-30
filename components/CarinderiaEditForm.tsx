'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MapboxLocationPicker, { PickedLocation } from '@/components/MapboxLocationPicker'

type Props = {
  carinderiaId: number
  initialName: string
  initialAddress: string
  initialDescription: string | null
  initialLatitude?: number | null
  initialLongitude?: number | null
}

export default function CarinderiaEditForm({
  carinderiaId,
  initialName,
  initialAddress,
  initialDescription,
  initialLatitude,
  initialLongitude,
}: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const existingLocation =
    initialLatitude != null && initialLongitude != null
      ? { name: initialAddress, lat: initialLatitude, lng: initialLongitude }
      : null

  const [location, setLocation] = useState<PickedLocation | null>(existingLocation)
  const [showPicker, setShowPicker] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    const fd = new FormData(e.currentTarget)
    const body = {
      name: (fd.get('name') as string).trim(),
      address: location?.name ?? initialAddress,
      description: (fd.get('description') as string).trim() || null,
      latitude: location?.lat,
      longitude: location?.lng,
    }

    try {
      const res = await fetch(`/api/carinderia/${carinderiaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        const e = data.error
        setError(
          typeof e === 'string'
            ? e
            : e?.formErrors?.[0] ??
              (Object.values(e?.fieldErrors ?? {}) as string[][])?.[0]?.[0] ??
              'Failed to save changes',
        )
        return
      }

      setSuccess(true)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
      )}
      {success && (
        <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-md">
          Changes saved successfully.
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="ce-name">Name *</Label>
        <Input
          id="ce-name"
          name="name"
          required
          maxLength={100}
          defaultValue={initialName}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Location</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPicker((v) => !v)}
        >
          {location ? 'Change location' : 'Pick location on map'}
        </Button>
        {location && (
          <p className="text-xs text-muted-foreground">{location.name}</p>
        )}
        {showPicker && (
          <div className="mt-2">
            <MapboxLocationPicker
              onConfirm={(loc) => {
                setLocation(loc)
                setShowPicker(false)
              }}
              initialLocation={existingLocation ?? undefined}
              confirmLabel="Use this location"
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ce-description">Description</Label>
        <textarea
          id="ce-description"
          name="description"
          rows={4}
          defaultValue={initialDescription ?? ''}
          placeholder="What's on the menu? Opening hours, specialties…"
          className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Button type="submit" size="sm" disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}
