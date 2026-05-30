'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  firstName:   string
  lastName:    string
  email:       string
  phoneNumber: string | null
}

export default function ProfileAccountEdit({ firstName, lastName, email, phoneNumber }: Props) {
  const router = useRouter()
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [first, setFirst]         = useState(firstName)
  const [last, setLast]           = useState(lastName)
  const [phone, setPhone]         = useState(phoneNumber ?? '')

  function handleCancel() {
    setFirst(firstName)
    setLast(lastName)
    setPhone(phoneNumber ?? '')
    setError(null)
    setEditing(false)
  }

  async function handleSave() {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/profile/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name:   first.trim(),
          last_name:    last.trim(),
          phone_number: phone.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to save. Please try again.')
        return
      }
      setEditing(false)
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="space-y-3">
        <dl className="space-y-2 text-sm">
          <Row label="Name"  value={`${firstName} ${lastName}`} />
          <Row label="Email" value={email} />
          <Row label="Phone" value={phoneNumber ?? '—'} />
        </dl>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            maxLength={50}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            maxLength={50}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled className="bg-muted text-muted-foreground" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone_number">Mobile number</Label>
        <Input
          id="phone_number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={20}
          placeholder="e.g. 09171234567"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving || !first.trim() || !last.trim()}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="flex-1">{value}</dd>
    </div>
  )
}
