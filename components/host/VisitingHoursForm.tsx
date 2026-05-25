'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type VisitingHour = {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function VisitingHoursForm({
  housingId,
  visitingHours,
}: {
  housingId: number
  visitingHours: VisitingHour[]
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
      day_of_week: Number(fd.get('day_of_week')),
      start_time: fd.get('start_time') as string,
      end_time: fd.get('end_time') as string,
    }

    try {
      const res = await fetch(`/api/host/housing/${housingId}/visiting-hours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error?.formErrors?.[0] ?? data.error ?? 'Failed to add slot')
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

  async function handleDelete(id: number) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/host/housing/${housingId}/visiting-hours`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to remove slot')
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
      {visitingHours.length > 0 && (
        <ul className="space-y-2">
          {visitingHours.map((vh) => (
            <li key={vh.id} className="flex items-center justify-between border rounded-md px-4 py-2 text-sm">
              <span>
                <span className="font-medium">{DAY_NAMES[vh.day_of_week]}</span>
                <span className="text-muted-foreground"> · {vh.start_time} – {vh.end_time}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={deleting === vh.id}
                onClick={() => handleDelete(vh.id)}
                className="text-destructive hover:text-destructive"
              >
                {deleting === vh.id ? 'Removing…' : 'Remove'}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="border rounded-lg p-4 space-y-4 bg-muted/30">
        <p className="text-sm font-medium">Add a visiting hours slot</p>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="space-y-1">
          <Label htmlFor="day_of_week">Day *</Label>
          <select
            id="day_of_week"
            name="day_of_week"
            required
            defaultValue=""
            className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="" disabled>Select a day</option>
            {DAY_NAMES.map((day, i) => (
              <option key={i} value={i}>{day}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="start_time">Start time *</Label>
            <Input id="start_time" name="start_time" type="time" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="end_time">End time *</Label>
            <Input id="end_time" name="end_time" type="time" required />
          </div>
        </div>

        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add slot'}
        </Button>
      </form>
    </div>
  )
}
