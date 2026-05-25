'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type HousingImage = {
  image_id: number
  url: string
  caption: string | null
  is_primary: boolean
  sort_order: number
}

export default function ImageURLForm({
  housingId,
  images,
}: {
  housingId: number
  images: HousingImage[]
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
      caption: (fd.get('caption') as string) || null,
      is_primary: fd.get('is_primary') === 'on',
      sort_order: fd.get('sort_order') ? Number(fd.get('sort_order')) : 0,
    }

    try {
      const res = await fetch(`/api/host/housing/${housingId}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error?.formErrors?.[0] ?? data.error ?? 'Failed to add image')
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
      const res = await fetch(`/api/host/housing/${housingId}/images`, {
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
                alt={img.caption ?? 'Listing image'}
                width={48}
                height={48}
                unoptimized
                className="w-12 h-12 object-cover rounded shrink-0"
              />
              <span className="flex-1 text-sm truncate text-muted-foreground">{img.url}</span>
              {img.is_primary && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0">Primary</span>
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
          <Label htmlFor="url">Image URL *</Label>
          <Input
            id="url"
            name="url"
            type="url"
            required
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="caption">Caption</Label>
            <Input id="caption" name="caption" maxLength={200} placeholder="e.g. Front view" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sort_order">Sort order</Label>
            <Input id="sort_order" name="sort_order" type="number" min={0} defaultValue={0} />
          </div>
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
