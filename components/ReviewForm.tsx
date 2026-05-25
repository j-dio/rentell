'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type Props = {
  listingType: 'housing' | 'carinderia'
  listingId: number
}

const STARS = [1, 2, 3, 4, 5]

export default function ReviewForm({ listingType, listingId }: Props) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_type: listingType,
          listing_id: listingId,
          rating,
          comment: comment || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        const e = data.error
        setError(typeof e === 'string' ? e : e?.formErrors?.[0] ?? Object.values(e?.fieldErrors ?? {})?.[0]?.[0] ?? 'Failed to submit review')
        return
      }

      setRating(0)
      setComment('')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <p className="text-sm font-medium">Write a review</p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-1">
        <Label>Rating *</Label>
        <div className="flex gap-1">
          {STARS.map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              className={`text-2xl transition-colors ${s <= (hovered || rating) ? 'text-yellow-500' : 'text-muted-foreground'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="comment">Comment</Label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Share your experience…"
          className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Button type="submit" size="sm" disabled={submitting || rating === 0}>
        {submitting ? 'Submitting…' : 'Submit review'}
      </Button>
    </form>
  )
}
