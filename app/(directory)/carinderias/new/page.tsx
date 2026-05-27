'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewCarinderiaPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const fd = new FormData(e.currentTarget)

    const body = {
      name: (fd.get('name') as string).trim(),
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
      router.push(`/carinderias/${carinderia_id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/carinderias" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to carinderias
        </Link>
        <h1 className="text-2xl font-bold mt-3">Add a carinderia</h1>
      </div>

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
            {submitting ? 'Adding…' : 'Add carinderia'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </main>
  )
}
