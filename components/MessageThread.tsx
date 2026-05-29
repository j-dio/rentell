'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MessageBubble from '@/components/MessageBubble'
import type { Message } from '@/lib/queries/messages'

type Props = {
  conversationId: number
  currentUserId: number
  otherUserName: string
  housingId: number | null
  housingName: string | null
  initialMessages: Message[]
}

export default function MessageThread({
  conversationId,
  currentUserId,
  otherUserName,
  housingId,
  housingName,
  initialMessages,
}: Props) {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Poll for new messages every 3 seconds; skip when tab is hidden to save bandwidth.
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) router.refresh()
    }, 3000)
    return () => clearInterval(interval)
  }, [router])

  // Scroll to bottom on initial render (instant) and whenever new messages arrive (smooth).
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: isFirstRender.current ? 'auto' : 'smooth',
    })
    isFirstRender.current = false
  }, [initialMessages.length])

  async function doSend() {
    if (!body.trim()) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, body: body.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        const err = data.error
        setError(
          typeof err === 'string'
            ? err
            : err?.formErrors?.[0] ??
              Object.values((err?.fieldErrors ?? {}) as Record<string, string[]>)?.[0]?.[0] ??
              'Failed to send message',
        )
        return
      }

      setBody('')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    doSend()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--site-header-height)-2rem)]">
      {/* Thread header */}
      <div className="border-b pb-4 mb-4 space-y-0.5">
        <h1 className="text-xl font-bold">{otherUserName}</h1>
        {housingId && housingName && (
          <Link
            href={`/housing/${housingId}`}
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            {housingName}
          </Link>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {initialMessages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            No messages yet. Say hello!
          </p>
        )}
        {initialMessages.map((msg) => (
          <MessageBubble
            key={msg.message_id}
            message={msg}
            isMine={msg.sender_id === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Send form */}
      <div className="border-t pt-4 mt-4">
        {error && <p className="text-sm text-destructive mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                doSend()
              }
            }}
            rows={2}
            maxLength={4000}
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            className="flex-1 border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
            {submitting ? 'Sending…' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  )
}
