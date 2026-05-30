'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import StepIndicator from '@/components/StepIndicator'
import ImageURLForm from '@/components/host/ImageURLForm'
import RoomForm from '@/components/host/RoomForm'
import AmenityTagForm from '@/components/host/AmenityTagForm'
import MapboxLocationPicker, { type PickedLocation } from '@/components/MapboxLocationPicker'

const STEPS = ['Basic Info', 'Add Photos', 'Add Rooms', 'Tag Amenities']

const HOUSING_TYPES = [
  { value: 'dormitory', label: 'Dormitory' },
  { value: 'boarding_house', label: 'Boarding House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'other', label: 'Other' },
]

type Step = 'form' | 'photos' | 'rooms' | 'amenities'

type Props = {
  allAmenities: string[]
}

export default function NewListingClient({ allAmenities }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [housingId, setHousingId] = useState<number | null>(null)
  const [housingName, setHousingName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [locationPick, setLocationPick] = useState<PickedLocation | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const fd = new FormData(e.currentTarget)
    const name = (fd.get('name') as string).trim()
    const priceMin = fd.get('monthly_price_min') ? Number(fd.get('monthly_price_min')) : null
    const priceMax = fd.get('monthly_price_max') ? Number(fd.get('monthly_price_max')) : null

    if (priceMin != null && priceMax != null && priceMin > priceMax) {
      setError('Min price cannot be greater than max price.')
      setSubmitting(false)
      return
    }

    if (!locationPick) {
      setError('Please select a location for your listing.')
      setSubmitting(false)
      return
    }

    const body = {
      name,
      housing_type: fd.get('housing_type') as string,
      address: locationPick.name,
      latitude: locationPick.lat,
      longitude: locationPick.lng,
      contact_person: (fd.get('contact_person') as string).trim() || null,
      contact_number: (fd.get('contact_number') as string).trim() || null,
      description: (fd.get('description') as string).trim() || null,
      monthly_price_min: priceMin,
      monthly_price_max: priceMax,
    }

    try {
      const res = await fetch('/api/host/housing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error?.formErrors?.[0] ?? data.error ?? 'Something went wrong')
        return
      }

      const { housing_id } = await res.json()
      setHousingId(housing_id)
      setHousingName(name)
      setStep('photos')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const stepIndex =
    step === 'form' ? 0 : step === 'photos' ? 1 : step === 'rooms' ? 2 : 3

  const header = (
    <div className="mb-2">
      <Link href="/listings" className="text-sm text-muted-foreground hover:text-foreground">
        ← My Listings
      </Link>
      <h1 className="text-2xl font-bold mt-3">New Housing Listing</h1>
    </div>
  )

  // ── Step 4: Tag Amenities ─────────────────────────────────────────────────
  if (step === 'amenities' && housingId !== null) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10">
        {header}
        <StepIndicator steps={STEPS} current={stepIndex} />

        <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm font-medium text-primary">Almost done!</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tag the amenities your property offers.{' '}
            <span className="italic">You can always change these later.</span>
          </p>
        </div>

        <AmenityTagForm
          housingId={housingId}
          allAmenities={allAmenities}
          taggedAmenities={[]}
        />

        <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t">
          <Button onClick={() => router.push('/listings')}>
            Done — Go to My Listings →
          </Button>
          <Button variant="outline" onClick={() => router.push('/listings')}>
            Skip for now
          </Button>
          <Link
            href={`/dashboard/${housingId}`}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            Full listing setup ↗
          </Link>
        </div>
      </main>
    )
  }

  // ── Step 3: Add Rooms ─────────────────────────────────────────────────────
  if (step === 'rooms' && housingId !== null) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10">
        {header}
        <StepIndicator steps={STEPS} current={stepIndex} />

        <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm font-medium text-primary">Almost there!</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add the rooms or unit types available in your property.{' '}
            <span className="italic">You can skip this and add them later.</span>
          </p>
        </div>

        <RoomForm housingId={housingId} rooms={[]} />

        <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t">
          <Button onClick={() => setStep('amenities')}>
            Continue to Tag Amenities →
          </Button>
          <Button variant="outline" onClick={() => router.push('/listings')}>
            Skip remaining steps
          </Button>
          <Link
            href={`/housing/${housingId}`}
            target="_blank"
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            View listing ↗
          </Link>
        </div>
      </main>
    )
  }

  // ── Step 2: Add Photos ────────────────────────────────────────────────────
  if (step === 'photos' && housingId !== null) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10">
        {header}
        <StepIndicator steps={STEPS} current={stepIndex} />

        <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm font-medium text-primary">
            ✓ &ldquo;{housingName}&rdquo; was created!
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add photos to showcase your property.{' '}
            <span className="italic">This step is optional.</span>
          </p>
        </div>

        <ImageURLForm housingId={housingId} images={[]} />

        <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t">
          <Button onClick={() => setStep('rooms')}>
            Continue to Add Rooms →
          </Button>
          <Button variant="outline" onClick={() => router.push('/listings')}>
            Skip remaining steps
          </Button>
          <Link
            href={`/housing/${housingId}`}
            target="_blank"
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            View listing ↗
          </Link>
        </div>
      </main>
    )
  }

  // ── Step 1: Basic Info ────────────────────────────────────────────────────
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {header}
      <StepIndicator steps={STEPS} current={stepIndex} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Listing name *</Label>
          <Input id="name" name="name" required maxLength={100} placeholder="e.g. Sunshine Dormitory" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="housing_type">Type *</Label>
          <select
            id="housing_type"
            name="housing_type"
            required
            defaultValue=""
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="" disabled>Select a type</option>
            {HOUSING_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Location *</Label>
          <MapboxLocationPicker
            onConfirm={setLocationPick}
            onLocationChange={setLocationPick}
            confirmLabel={locationPick ? '✓ Location set — click to change' : 'Confirm location'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthly_price_min">Min price (₱/mo)</Label>
            <Input id="monthly_price_min" name="monthly_price_min" type="number" min={1} step="0.01" placeholder="e.g. 2500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly_price_max">Max price (₱/mo)</Label>
            <Input id="monthly_price_max" name="monthly_price_max" type="number" min={1} step="0.01" placeholder="e.g. 4000" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact person</Label>
            <Input id="contact_person" name="contact_person" maxLength={100} placeholder="e.g. Maria Santos" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_number">Contact number</Label>
            <Input id="contact_number" name="contact_number" maxLength={20} placeholder="e.g. 09171234567" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe the property, rules, nearby landmarks…"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Save & Add Photos →'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </main>
  )
}
