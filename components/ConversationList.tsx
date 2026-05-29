import Link from 'next/link'
import type { ConversationListItem } from '@/lib/queries/messages'

type Props = {
  conversations: ConversationListItem[]
}

function formatRelativeTime(date: Date | null): string {
  if (!date) return ''
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export default function ConversationList({ conversations }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-20 border rounded-lg text-muted-foreground">
        <p className="text-lg font-medium">No conversations yet</p>
        <p className="text-sm mt-1">
          Find a listing on the{' '}
          <Link href="/housing" className="text-primary hover:underline">
            Housing
          </Link>{' '}
          page and click &quot;Message host&quot; to start one.
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y border rounded-lg overflow-hidden">
      {conversations.map((c) => (
        <li key={c.conversation_id}>
          <Link
            href={`/messages/${c.conversation_id}`}
            className="flex items-center gap-4 px-4 py-4 hover:bg-accent/50 transition-colors"
          >
            {/* Unread indicator dot — only rendered when there are unread messages */}
            {c.unread_count > 0
              ? <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-primary mt-0.5" />
              : <div className="shrink-0 w-2.5" />
            }

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className={`text-sm truncate ${c.unread_count > 0 ? 'font-semibold' : 'font-medium'}`}>
                  {c.other_user_name}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(c.last_message_at)}
                </span>
              </div>

              {c.housing_name && (
                <p className="text-xs text-muted-foreground truncate">{c.housing_name}</p>
              )}

              {c.last_message_body && (
                <p className={`text-sm truncate mt-0.5 ${c.unread_count > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {c.last_message_body}
                </p>
              )}
            </div>

            {c.unread_count > 0 && (
              <span className="shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                {c.unread_count > 99 ? '99+' : c.unread_count}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
