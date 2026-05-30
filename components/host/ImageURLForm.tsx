'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ImageDropZone from '@/components/ImageDropZone'

type HousingImage = {
  image_id: number
  url: string
  caption: string | null
  is_primary: boolean
  sort_order: number
}

export default function ImageURLForm({
  housingId,
  images: initialImages,
}: {
  housingId: number
  images: HousingImage[]
}) {
  const [images, setImages] = useState<HousingImage[]>(initialImages)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [showUrlForm, setShowUrlForm] = useState(false)
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploadIsPrimary, setUploadIsPrimary] = useState(false)

  async function addImage(
    url: string,
    caption: string | null,
    isPrimary: boolean,
    sortOrder: number,
  ): Promise<HousingImage> {
    const res = await fetch(`/api/host/housing/${housingId}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, caption, is_primary: isPrimary, sort_order: sortOrder }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error?.formErrors?.[0] ?? data.error ?? 'Failed to add image')
    }
    return res.json()
  }

  async function handleFileUploaded(url: string) {
    setError(null)
    try {
      const newImage = await addImage(url, uploadCaption.trim() || null, uploadIsPrimary, 0)
      setImages((prev) => [...prev, newImage])
      setUploadCaption('')
      setUploadIsPrimary(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add image')
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    try {
      const newImage = await addImage(
        fd.get('url') as string,
        (fd.get('caption') as string) || null,
        fd.get('is_primary') === 'on',
        fd.get('sort_order') ? Number(fd.get('sort_order')) : 0,
      )
      setImages((prev) => [...prev, newImage])
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.')
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
      setImages((prev) => prev.filter((img) => img.image_id !== imageId))
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
              <span className="flex-1 text-sm truncate text-muted-foreground">{img.caption ?? img.url}</span>
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

      <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Caption (optional)</Label>
            <Input
              value={uploadCaption}
              onChange={(e) => setUploadCaption(e.target.value)}
              maxLength={200}
              placeholder="e.g. Front view"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={uploadIsPrimary}
                onChange={(e) => setUploadIsPrimary(e.target.checked)}
                className="rounded"
              />
              Set as primary
            </label>
          </div>
        </div>

        <ImageDropZone onUploaded={handleFileUploaded} />

        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setShowUrlForm((v) => !v)}
        >
          {showUrlForm ? '▲ Hide URL input' : '▾ Or add by URL'}
        </button>

        {showUrlForm && (
          <form onSubmit={handleAdd} className="space-y-3 pt-2 border-t">
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
        )}
      </div>
    </div>
  )
}
