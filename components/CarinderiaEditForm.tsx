'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  carinderiaId: number
  initialName: string
  initialAddress: string
  initialDescription: string | null
}

export default function CarinderiaEditForm({
  carinderiaId,
  initialName,
  initialAddress,
  initialDescription,
}: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    const fd = new FormData(e.currentTarget)
    const body = {
      name: (fd.get('name') as string).trim(),
      address: (fd.get('address') as string).trim(),
      description: (fd.get('description') as string).trim() || null,
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
        <Label htmlFor="ce-address">Address *</Label>
        <Input
          id="ce-address"
          name="address"
          required
          defaultValue={initialAddress}
        />
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
