'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type CarinderiaImage = {
  image_id: number
  url: string
  caption: string | null
  is_primary: boolean
}

export default function CarinderiaImageForm({
  carinderiaId,
  images,
}: {
  carinderiaId: number
  images: CarinderiaImage[]
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const fd = new FormData(e.currentTarget)
    const body = {
      url: fd.get('url') as string,
      caption: (fd.get('caption') as string).trim() || null,
      is_primary: fd.get('is_primary') === 'on',
    }

    try {
      const res = await fetch(`/api/carinderia/${carinderiaId}/images`, {
        method: 'POST',
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
              'Failed to add image',
        )
        return
      }
      ;(e.target as HTMLFormElement).reset()
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(imageId: number) {
    setDeleting(imageId)
    try {
      const res = await fetch(`/api/carinderia/${carinderiaId}/images`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: imageId }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to remove image')
        return
      }
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <ul className="space-y-2">
          {images.map((img) => (
            <li key={img.image_id} className="flex items-center gap-3 border rounded-md px-4 py-2">
              <Image
                src={img.url}
                alt={img.caption ?? 'Carinderia image'}
                width={48}
                height={48}
                unoptimized
                className="w-12 h-12 object-cover rounded shrink-0"
              />
              <span className="flex-1 text-sm truncate text-muted-foreground">{img.url}</span>
              {img.is_primary && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0">
                  Primary
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={deleting === img.image_id}
                onClick={() => handleDelete(img.image_id)}
                className="shrink-0 text-destructive hover:text-destructive"
              >
                {deleting === img.image_id ? 'Removing…' : 'Remove'}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="border rounded-lg p-4 space-y-4 bg-muted/30">
        <p className="text-sm font-medium">Add an image URL</p>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="space-y-1">
          <Label htmlFor="ci-url">Image URL *</Label>
          <Input
            id="ci-url"
            name="url"
            type="url"
            required
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="ci-caption">Caption</Label>
          <Input id="ci-caption" name="caption" maxLength={200} placeholder="e.g. Inside the canteen" />
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" name="is_primary" className="rounded" />
          Set as primary image
        </label>

        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add image'}
        </Button>
      </form>
    </div>
  )
}
