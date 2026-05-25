'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Review } from '@/lib/queries/reviews'

type Props = {
  reviews: Review[]
  currentUserId?: number
}

const STARS = [1, 2, 3, 4, 5]

export default function ReviewList({ reviews, currentUserId }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState<number | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  function startEdit(review: Review) {
    setEditing(review.review_id)
    setEditRating(review.rating)
    setEditComment(review.comment ?? '')
    setError(null)
  }

  async function handleUpdate(reviewId: number) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: editRating, comment: editComment || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        const e = data.error
        setError(typeof e === 'string' ? e : e?.formErrors?.[0] ?? Object.values(e?.fieldErrors ?? {})?.[0]?.[0] ?? 'Failed to update')
        return
      }
      setEditing(null)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(reviewId: number) {
    setDeleting(reviewId)
    setError(null)
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to delete')
        return
      }
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">No reviews yet.</p>
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {reviews.map((r) =>
        editing === r.review_id ? (
          <div key={r.review_id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <div className="flex gap-1">
              {STARS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setEditRating(s)}
                  className={`text-xl ${s <= editRating ? 'text-yellow-500' : 'text-muted-foreground'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              rows={3}
              maxLength={2000}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2">
              <Button size="sm" disabled={submitting || editRating === 0} onClick={() => handleUpdate(r.review_id)}>
                {submitting ? 'Saving…' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div key={r.review_id} className="border rounded-lg p-4 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{r.reviewer_name}</span>
                <span className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
            {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
            {currentUserId === r.reviewer_id && (
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => startEdit(r)}>Edit</Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleting === r.review_id}
                  onClick={() => handleDelete(r.review_id)}
                  className="text-destructive hover:text-destructive"
                >
                  {deleting === r.review_id ? 'Removing…' : 'Delete'}
                </Button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  )
}
