'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const HOUSING_TYPES = [
  { value: 'dormitory', label: 'Dormitory' },
  { value: 'boarding_house', label: 'Boarding House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'other', label: 'Other' },
]

export default function NewListingPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const fd = new FormData(e.currentTarget)

    const body = {
      name: fd.get('name') as string,
      housing_type: fd.get('housing_type') as string,
      address: fd.get('address') as string,
      contact_person: (fd.get('contact_person') as string) || null,
      contact_number: (fd.get('contact_number') as string) || null,
      description: (fd.get('description') as string) || null,
      monthly_price_min: fd.get('monthly_price_min') ? Number(fd.get('monthly_price_min')) : null,
      monthly_price_max: fd.get('monthly_price_max') ? Number(fd.get('monthly_price_max')) : null,
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
      router.push(`/dashboard/${housing_id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-3">New listing</h1>
      </div>

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
          <Label htmlFor="address">Address *</Label>
          <Input id="address" name="address" required placeholder="e.g. 45 Osmena Blvd, Cebu City" />
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
            {submitting ? 'Creating…' : 'Create listing'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </main>
  )
}
