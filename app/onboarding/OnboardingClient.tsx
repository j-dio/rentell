'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MapboxLocationPicker, { type PickedLocation } from '@/components/MapboxLocationPicker'

type Step = 'welcome' | 'location' | 'phone'

export default function OnboardingClient({
  redirectTo = '/',
}: {
  redirectTo?: string
}) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [saving, setSaving] = useState(false)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function saveLocation(loc: PickedLocation) {
    const res = await fetch('/api/profile/location', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preferred_location_name: loc.name,
        preferred_location_lat: loc.lat,
        preferred_location_lng: loc.lng,
      }),
    })
    if (res.ok) setStep('phone')
  }

  async function finish() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone.trim() || null }),
      })
      if (!res.ok) { setError('Something went wrong. Please try again.'); return }
      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('Network error.')
    } finally {
      setSaving(false)
    }
  }

  const progressWidth = step === 'welcome' ? '33%' : step === 'location' ? '66%' : '100%'

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: progressWidth }}
          />
        </div>

        <div className="p-8 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="space-y-4"
              >
                <h1 className="text-2xl font-bold">Welcome to RenTell</h1>
                <p className="text-sm text-muted-foreground">
                  Let&apos;s set up your profile in a few quick steps so we can show you relevant listings.
                </p>
                <Button className="w-full" onClick={() => setStep('location')}>
                  Get started →
                </Button>
              </motion.div>
            )}

            {step === 'location' && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold">Your location</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    We&apos;ll use this to show distances from listings to your area.
                  </p>
                </div>
                <MapboxLocationPicker
                  onConfirm={saveLocation}
                  confirmLabel="Save location & continue →"
                />
              </motion.div>
            )}

            {step === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold">Phone number</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Optional. Hosts may use this to reach you about a listing.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 09171234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={20}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={finish} disabled={saving}>
                    {saving ? 'Finishing…' : 'Finish setup →'}
                  </Button>
                  <Button variant="outline" onClick={finish} disabled={saving}>
                    Skip
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
