'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Carinderia = { carinderia_id: number; name: string; address: string }
type Essential  = { essential_id: number; name: string; type: string; address: string }

export default function NearbyAttachForm({
  housingId,
  allCarinderias,
  allEssentials,
  linkedCarinderiaIds,
  linkedEssentialIds,
}: {
  housingId: number
  allCarinderias: Carinderia[]
  allEssentials: Essential[]
  linkedCarinderiaIds: number[]
  linkedEssentialIds: number[]
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [unlinking, setUnlinking] = useState<string | null>(null)

  const linkedCSet = new Set(linkedCarinderiaIds)
  const linkedESet = new Set(linkedEssentialIds)

  const availableCarinderias = allCarinderias.filter((c) => !linkedCSet.has(c.carinderia_id))
  const availableEssentials  = allEssentials.filter((e) => !linkedESet.has(e.essential_id))

  async function handleLink(type: 'carinderia' | 'essential', e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd = new FormData(e.currentTarget)
    const id = Number(fd.get(`${type}_id`))
    const distance_km = fd.get('distance_km') ? Number(fd.get('distance_km')) : null

    const body = type === 'carinderia'
      ? { type, carinderia_id: id, distance_km }
      : { type, essential_id: id, distance_km }

    try {
      const res = await fetch(`/api/host/housing/${housingId}/nearby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to link')
        return
      }
      ;(e.target as HTMLFormElement).reset()
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    }
  }

  async function handleUnlink(type: 'carinderia' | 'essential', id: number) {
    const key = `${type}-${id}`
    setUnlinking(key)
    setError(null)

    const body = type === 'carinderia'
      ? { type, carinderia_id: id }
      : { type, essential_id: id }

    try {
      const res = await fetch(`/api/host/housing/${housingId}/nearby`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to unlink')
        return
      }
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setUnlinking(null)
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Carinderia section */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Unlink carinderias</p>
        {linkedCarinderiaIds.length === 0 ? (
          <p className="text-xs text-muted-foreground">None linked.</p>
        ) : (
          <ul className="space-y-2">
            {allCarinderias.filter((c) => linkedCSet.has(c.carinderia_id)).map((c) => (
              <li key={c.carinderia_id} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                <span>{c.name} <span className="text-muted-foreground">· {c.address}</span></span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={unlinking === `carinderia-${c.carinderia_id}`}
                  onClick={() => handleUnlink('carinderia', c.carinderia_id)}
                  className="text-destructive hover:text-destructive"
                >
                  {unlinking === `carinderia-${c.carinderia_id}` ? 'Removing…' : 'Unlink'}
                </Button>
              </li>
            ))}
          </ul>
        )}

        {availableCarinderias.length > 0 && (
          <form onSubmit={(e) => handleLink('carinderia', e)} className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-medium">Link a carinderia</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="carinderia_id">Carinderia *</Label>
                <select
                  id="carinderia_id"
                  name="carinderia_id"
                  required
                  defaultValue=""
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="" disabled>Select</option>
                  {availableCarinderias.map((c) => (
                    <option key={c.carinderia_id} value={c.carinderia_id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="c_distance_km">Distance (km)</Label>
                <Input id="c_distance_km" name="distance_km" type="number" min={0} step="0.01" placeholder="e.g. 0.3" />
              </div>
            </div>
            <Button type="submit" size="sm">Link carinderia</Button>
          </form>
        )}
      </div>

      {/* Essential section */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Unlink essentials</p>
        {linkedEssentialIds.length === 0 ? (
          <p className="text-xs text-muted-foreground">None linked.</p>
        ) : (
          <ul className="space-y-2">
            {allEssentials.filter((e) => linkedESet.has(e.essential_id)).map((e) => (
              <li key={e.essential_id} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                <span>{e.name} <span className="text-muted-foreground capitalize">· {e.type}</span></span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={unlinking === `essential-${e.essential_id}`}
                  onClick={() => handleUnlink('essential', e.essential_id)}
                  className="text-destructive hover:text-destructive"
                >
                  {unlinking === `essential-${e.essential_id}` ? 'Removing…' : 'Unlink'}
                </Button>
              </li>
            ))}
          </ul>
        )}

        {availableEssentials.length > 0 && (
          <form onSubmit={(e) => handleLink('essential', e)} className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-medium">Link an essential</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="essential_id">Essential *</Label>
                <select
                  id="essential_id"
                  name="essential_id"
                  required
                  defaultValue=""
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="" disabled>Select</option>
                  {availableEssentials.map((e) => (
                    <option key={e.essential_id} value={e.essential_id}>{e.name} ({e.type})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="e_distance_km">Distance (km)</Label>
                <Input id="e_distance_km" name="distance_km" type="number" min={0} step="0.01" placeholder="e.g. 0.5" />
              </div>
            </div>
            <Button type="submit" size="sm">Link essential</Button>
          </form>
        )}
      </div>
    </div>
  )
}
