'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_BYTES = 5 * 1024 * 1024

type Props = {
  onUploaded: (url: string) => void
  disabled?: boolean
}

export default function ImageDropZone({ onUploaded, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function uploadFiles(files: FileList | File[]) {
    setError(null)
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not a supported type. Use JPEG, PNG, WebP, or GIF.`)
        continue
      }
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" exceeds the 5 MB limit.`)
        continue
      }

      setUploading(true)
      const fd = new FormData()
      fd.append('file', file)

      try {
        const res = await fetch('/api/images/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? 'Upload failed')
          continue
        }
        const { url } = await res.json()
        onUploaded(url)
      } catch {
        setError('Network error during upload.')
      } finally {
        setUploading(false)
      }
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (disabled || uploading) return
    uploadFiles(e.dataTransfer.files)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={[
        'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
        dragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20',
        disabled || uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer',
      ].join(' ')}
      onClick={() => !disabled && !uploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        disabled={disabled || uploading}
      />

      {uploading ? (
        <p className="text-sm text-muted-foreground">Uploading…</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-3">
            Drag images here, or
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
          >
            Import images
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            JPEG, PNG, WebP, GIF · max 5 MB each
          </p>
        </>
      )}

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  )
}
