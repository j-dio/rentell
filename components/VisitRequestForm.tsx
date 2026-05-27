'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { VisitingHour } from '@/lib/queries/visits'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type Props = {
  housingId: number
  visitingHours: VisitingHour[]
}

/** Formats a Date as the value `datetime-local` inputs expect: "YYYY-MM-DDTHH:MM" */
function toDatetimeLocalMin(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

export default function VisitRequestForm({ housingId, visitingHours }: Props) {
  const router = useRouter()
  const [scheduledAt, setScheduledAt] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!scheduledAt) return
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          housing_id: housingId,
          scheduled_at: new Date(scheduledAt).toISOString(),
          note: note || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        const err = data.error
        setError(
          typeof err === 'string'
            ? err
            : err?.formErrors?.[0] ??
              Object.values((err?.fieldErrors ?? {}) as Record<string, string[]>)?.[0]?.[0] ??
              'Failed to submit visit request',
        )
        return
      }

      setScheduledAt('')
      setNote('')
      setSuccess(true)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <p className="text-sm font-semibold">Book a Visit</p>

      {visitingHours.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Visiting Hours
          </p>
          <ul className="text-sm space-y-0.5">
            {visitingHours.map((vh) => (
              <li key={vh.id}>
                <span className="font-medium">{DAY_NAMES[vh.day_of_week]}</span>{' '}
                {vh.start_time} – {vh.end_time}
              </li>
            ))}
          </ul>
        </div>
      )}

      {success && (
        <p className="text-sm text-green-600">Visit request submitted! The owner will confirm shortly.</p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="scheduled_at">Preferred date &amp; time</Label>
          <input
            id="scheduled_at"
            type="datetime-local"
            value={scheduledAt}
            min={toDatetimeLocalMin(new Date())}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="visit-note">Note <span className="text-muted-foreground">(optional)</span></Label>
          <textarea
            id="visit-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Any questions or special requests…"
            className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Button type="submit" size="sm" disabled={submitting || !scheduledAt}>
          {submitting ? 'Submitting…' : 'Request visit'}
        </Button>
      </form>
    </div>
  )
}
