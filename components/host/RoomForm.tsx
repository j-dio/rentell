'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Room = {
  room_id: number
  room_number: string | null
  room_type: string
  capacity: number
  available_slots: number
  monthly_price: string
}

const ROOM_TYPES = [
  { value: 'private', label: 'Private' },
  { value: 'shared', label: 'Shared' },
  { value: 'bedspacer', label: 'Bedspacer' },
]

export default function RoomForm({
  housingId,
  rooms,
}: {
  housingId: number
  rooms: Room[]
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Partial<Room>>({})

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const fd = new FormData(e.currentTarget)
    const body = {
      room_number: (fd.get('room_number') as string) || null,
      room_type: fd.get('room_type') as string,
      capacity: Number(fd.get('capacity')),
      available_slots: Number(fd.get('available_slots')),
      monthly_price: Number(fd.get('monthly_price')),
    }

    try {
      const res = await fetch(`/api/host/housing/${housingId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error?.formErrors?.[0] ?? data.error ?? 'Failed to add room')
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

  async function handleEdit(roomId: number) {
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        ...editValues,
        room_id: roomId,
        monthly_price: editValues.monthly_price !== undefined
          ? Number(editValues.monthly_price)
          : undefined,
      }
      const res = await fetch(`/api/host/housing/${housingId}/rooms`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        const e = data.error
        const msg = typeof e === 'string'
          ? e
          : e?.formErrors?.[0] ?? Object.values(e?.fieldErrors ?? {})?.[0]?.[0] ?? 'Failed to update room'
        setError(msg)
        return
      }
      setEditingId(null)
      setEditValues({})
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(roomId: number) {
    setDeleting(roomId)
    setError(null)
    try {
      const res = await fetch(`/api/host/housing/${housingId}/rooms`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to delete room')
        return
      }
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  function startEdit(room: Room) {
    setEditingId(room.room_id)
    setEditValues({
      room_number: room.room_number,
      room_type: room.room_type,
      capacity: room.capacity,
      available_slots: room.available_slots,
      monthly_price: room.monthly_price,
    })
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {rooms.length === 0 && (
        <p className="text-sm text-muted-foreground">No rooms yet.</p>
      )}

      {rooms.map((r) =>
        editingId === r.room_id ? (
          <div key={r.room_id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <p className="text-sm font-medium">Editing room</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <select
                  value={editValues.room_type ?? r.room_type}
                  onChange={(e) => setEditValues((v) => ({ ...v, room_type: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {ROOM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Room no.</Label>
                <Input
                  value={editValues.room_number ?? ''}
                  onChange={(e) => setEditValues((v) => ({ ...v, room_number: e.target.value || null }))}
                  maxLength={20}
                  placeholder="e.g. 101"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min={1}
                  value={editValues.capacity ?? r.capacity}
                  onChange={(e) => setEditValues((v) => ({ ...v, capacity: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Available</Label>
                <Input
                  type="number"
                  min={0}
                  value={editValues.available_slots ?? r.available_slots}
                  onChange={(e) => setEditValues((v) => ({ ...v, available_slots: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Price (₱/mo)</Label>
                <Input
                  type="number"
                  min={1}
                  step="0.01"
                  value={editValues.monthly_price ?? r.monthly_price}
                  onChange={(e) => setEditValues((v) => ({ ...v, monthly_price: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" disabled={submitting} onClick={() => handleEdit(r.room_id)}>
                {submitting ? 'Saving…' : 'Save'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setEditValues({}) }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div key={r.room_id} className="border rounded-md px-4 py-3 flex items-center justify-between text-sm">
            <span>
              <span className="font-medium capitalize">{r.room_type}</span>
              {r.room_number && <span className="text-muted-foreground"> · #{r.room_number}</span>}
              <span className="text-muted-foreground">
                {' '}· {r.available_slots}/{r.capacity} slots · ₱{r.monthly_price}/mo
              </span>
            </span>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => startEdit(r)}>
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={deleting === r.room_id}
                onClick={() => handleDelete(r.room_id)}
                className="text-destructive hover:text-destructive"
              >
                {deleting === r.room_id ? 'Removing…' : 'Remove'}
              </Button>
            </div>
          </div>
        )
      )}

      {/* Add room form */}
      <form onSubmit={handleAdd} className="border rounded-lg p-4 space-y-4 bg-muted/30">
        <p className="text-sm font-medium">Add a room</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="room_type">Type *</Label>
            <select
              id="room_type"
              name="room_type"
              required
              defaultValue=""
              className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="" disabled>Select</option>
              {ROOM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="room_number">Room no.</Label>
            <Input id="room_number" name="room_number" maxLength={20} placeholder="e.g. 101" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="capacity">Capacity *</Label>
            <Input id="capacity" name="capacity" type="number" min={1} required placeholder="e.g. 4" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="available_slots">Available *</Label>
            <Input id="available_slots" name="available_slots" type="number" min={0} required placeholder="e.g. 2" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="monthly_price">Price (₱/mo) *</Label>
            <Input id="monthly_price" name="monthly_price" type="number" min={1} step="0.01" required placeholder="e.g. 3500" />
          </div>
        </div>

        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add room'}
        </Button>
      </form>
    </div>
  )
}
