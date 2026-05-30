'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MapboxLocationPicker, { type PickedLocation } from '@/components/MapboxLocationPicker'

const HOUSING_TYPES = [
  { value: 'dormitory', label: 'Dormitory' },
  { value: 'boarding_house', label: 'Boarding House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'other', label: 'Other' },
]

type Props = {
  housingId: number
  initialName: string
  initialType: string
  initialLocation: PickedLocation | null
  initialPriceMin: string | null
  initialPriceMax: string | null
  initialContactPerson: string | null
  initialContactNumber: string | null
  initialDescription: string | null
}

export default function HousingDetailsForm({
  housingId,
  initialName,
  initialType,
  initialLocation,
  initialPriceMin,
  initialPriceMax,
  initialContactPerson,
  initialContactNumber,
  initialDescription,
}: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [locationPick, setLocationPick] = useState<PickedLocation | null>(initialLocation)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    const fd = new FormData(e.currentTarget)
    const priceMin = fd.get('monthly_price_min') ? Number(fd.get('monthly_price_min')) : null
    const priceMax = fd.get('monthly_price_max') ? Number(fd.get('monthly_price_max')) : null

    if (priceMin != null && priceMax != null && priceMin > priceMax) {
      setError('Min price cannot be greater than max price.')
      setSaving(false)
      return
    }

    if (!locationPick) {
      setError('Please select a location.')
      setSaving(false)
      return
    }

    const body = {
      name: (fd.get('name') as string).trim(),
      housing_type: fd.get('housing_type') as string,
      address: locationPick.name,
      latitude: locationPick.lat,
      longitude: locationPick.lng,
      monthly_price_min: priceMin,
      monthly_price_max: priceMax,
      contact_person: (fd.get('contact_person') as string).trim() || null,
      contact_number: (fd.get('contact_number') as string).trim() || null,
      description: (fd.get('description') as string).trim() || null,
    }

    try {
      const res = await fetch(`/api/host/housing/${housingId}`, {
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
      )}
      {success && (
        <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-md">
          Changes saved successfully.
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="hd-name">Listing name *</Label>
        <Input id="hd-name" name="name" required maxLength={100} defaultValue={initialName} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hd-type">Type *</Label>
        <select
          id="hd-type"
          name="housing_type"
          required
          defaultValue={initialType}
          className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {HOUSING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>Location *</Label>
        <MapboxLocationPicker
          onConfirm={setLocationPick}
          onLocationChange={setLocationPick}
          initialLocation={initialLocation ?? undefined}
          confirmLabel={locationPick ? '✓ Location set — click to change' : 'Confirm location'}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="hd-price-min">Min price (₱/mo)</Label>
          <Input
            id="hd-price-min"
            name="monthly_price_min"
            type="number"
            min={1}
            step="0.01"
            defaultValue={initialPriceMin ?? ''}
            placeholder="e.g. 2500"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hd-price-max">Max price (₱/mo)</Label>
          <Input
            id="hd-price-max"
            name="monthly_price_max"
            type="number"
            min={1}
            step="0.01"
            defaultValue={initialPriceMax ?? ''}
            placeholder="e.g. 4000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="hd-contact-person">Contact person</Label>
          <Input
            id="hd-contact-person"
            name="contact_person"
            maxLength={100}
            defaultValue={initialContactPerson ?? ''}
            placeholder="e.g. Maria Santos"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hd-contact-number">Contact number</Label>
          <Input
            id="hd-contact-number"
            name="contact_number"
            maxLength={20}
            defaultValue={initialContactNumber ?? ''}
            placeholder="e.g. 09171234567"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hd-description">Description</Label>
        <textarea
          id="hd-description"
          name="description"
          rows={4}
          defaultValue={initialDescription ?? ''}
          placeholder="Describe the property, rules, nearby landmarks…"
          className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Button type="submit" size="sm" disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  )
}
