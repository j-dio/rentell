'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DeleteCarinderiaButton({
  carinderiaId,
  carinderiaName,
}: {
  carinderiaId: number
  carinderiaName: string
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${carinderiaName}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/carinderia/${carinderiaId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? 'Failed to delete')
        return
      }
      router.push('/listings')
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={deleting}
      onClick={handleDelete}
      className="text-destructive hover:text-destructive"
    >
      {deleting ? 'Deleting…' : 'Delete'}
    </Button>
  )
}
