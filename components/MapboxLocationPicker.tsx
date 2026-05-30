'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

export type PickedLocation = { name: string; lat: number; lng: number }

type Props = {
  onConfirm: (location: PickedLocation) => void
  initialLocation?: PickedLocation
  confirmLabel?: string
}

export default function MapboxLocationPicker({
  onConfirm,
  initialLocation,
  confirmLabel = 'Confirm location',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [query, setQuery] = useState(initialLocation?.name ?? '')
  const [suggestions, setSuggestions] = useState<{ place_name: string; center: [number, number] }[]>([])
  const [pending, setPending] = useState<PickedLocation | null>(initialLocation ?? null)

  useEffect(() => {
    if (!containerRef.current) return
    const center: [number, number] = initialLocation
      ? [initialLocation.lng, initialLocation.lat]
      : [123.8854, 10.3157]

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom: initialLocation ? 14 : 11,
    })

    if (initialLocation) {
      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([initialLocation.lng, initialLocation.lat])
        .addTo(mapRef.current)

      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current!.getLngLat()
        setPending((prev) => (prev ? { ...prev, lat: lngLat.lat, lng: lngLat.lng } : null))
      })
    }

    return () => {
      mapRef.current?.remove()
    }
  }, [])

  async function handleSearch(value: string) {
    setQuery(value)
    if (!value.trim()) { setSuggestions([]); return }
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json` +
        `?access_token=${mapboxgl.accessToken}&autocomplete=true&limit=5&country=ph`,
    )
    const data = await res.json()
    setSuggestions(data.features ?? [])
  }

  function select(s: { place_name: string; center: [number, number] }) {
    const [lng, lat] = s.center
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 14 })

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat])
    } else {
      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([lng, lat])
        .addTo(mapRef.current!)
      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current!.getLngLat()
        setPending((prev) => (prev ? { ...prev, lat: lngLat.lat, lng: lngLat.lng } : null))
      })
    }

    setPending({ name: s.place_name, lat, lng })
    setQuery(s.place_name)
    setSuggestions([])
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          placeholder="Search for a place or address…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  onClick={() => select(s)}
                >
                  {s.place_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div ref={containerRef} className="h-64 w-full rounded-lg overflow-hidden border border-border" />

      {pending && (
        <p className="text-xs text-muted-foreground">
          Selected: {pending.name} — drag the pin to fine-tune
        </p>
      )}

      <Button type="button" disabled={!pending} onClick={() => pending && onConfirm(pending)}>
        {confirmLabel}
      </Button>
    </div>
  )
}
