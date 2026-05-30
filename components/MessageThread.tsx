'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15">
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
              placeholder="Type a message… (Enter ↵ to send)"
              className="flex-1 resize-none bg-transparent py-1 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              aria-label="Send message"
              className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/85 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {submitting ? (
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="size-4 translate-x-px" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
