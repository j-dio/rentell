'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CarinderiaImageForm from '@/components/CarinderiaImageForm'

type Step = 'form' | 'images'

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-2 mb-8 text-sm">
      <span
        className={`flex items-center gap-1.5 font-medium ${
          current === 'form' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <span
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
            current === 'images'
              ? 'bg-primary/15 text-primary'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          {current === 'images' ? '✓' : '1'}
        </span>
        Basic Info
      </span>

      <span className="text-muted-foreground">›</span>

      <span
        className={`flex items-center gap-1.5 font-medium ${
          current === 'images' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        <span
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
            current === 'images'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          2
        </span>
        Add Photos
      </span>
    </div>
  )
}

export default function NewCarinderiaPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [carinderiaId, setCarinderiaId] = useState<number | null>(null)
  const [carinderiaName, setCarinderiaName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const fd = new FormData(e.currentTarget)
    const name = (fd.get('name') as string).trim()

    const body = {
      name,
      address: (fd.get('address') as string).trim(),
      description: (fd.get('description') as string).trim() || null,
    }

    try {
      const res = await fetch('/api/carinderia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?next=/carinderias/new')
          return
        }
        const data = await res.json()
        const e = data.error
        setError(
          typeof e === 'string'
            ? e
            : e?.formErrors?.[0] ??
              (Object.values(e?.fieldErrors ?? {}) as string[][])?.[0]?.[0] ??
              'Something went wrong',
        )
        return
      }

      const { carinderia_id } = await res.json()
      setCarinderiaId(carinderia_id)
      setCarinderiaName(name)
      setStep('images')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step 2: Add Photos ────────────────────────────────────────────────────
  if (step === 'images' && carinderiaId !== null) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-2">
          <Link href="/carinderias" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to carinderias
          </Link>
          <h1 className="text-2xl font-bold mt-3">Add a carinderia</h1>
        </div>

        <StepIndicator current="images" />

        <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm font-medium text-primary">
            ✓ &ldquo;{carinderiaName}&rdquo; was added!
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Now add some photos to help others find and recognize your listing.{' '}
            <span className="italic">This step is optional.</span>
          </p>
        </div>

        <CarinderiaImageForm carinderiaId={carinderiaId} images={[]} />

        <div className="flex items-center gap-3 mt-8 pt-6 border-t">
          <Button onClick={() => router.push('/listings')}>
            Done — Go to My Listings →
          </Button>
          <Button variant="outline" onClick={() => router.push('/listings')}>
            Skip for now
          </Button>
          <Link
            href={`/carinderias/${carinderiaId}`}
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
      <div className="mb-2">
        <Link href="/carinderias" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to carinderias
        </Link>
        <h1 className="text-2xl font-bold mt-3">Add a carinderia</h1>
      </div>

      <StepIndicator current="form" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={100}
            placeholder="e.g. Aling Nena's Carinderia"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            name="address"
            required
            placeholder="e.g. 12 Colon St, Cebu City"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="What's on the menu? Opening hours, specialties…"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save & Add Photos →'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </main>
  )
}
