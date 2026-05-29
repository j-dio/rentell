import type { Message } from '@/lib/queries/messages'

type Props = {
  message: Message
  isMine: boolean
}

export default function MessageBubble({ message, isMine }: Props) {
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
      {!isMine && (
        <span className="text-xs text-muted-foreground px-1">{message.sender_name}</span>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed break-words ${
          isMine
            ? 'rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-bl-sm bg-muted text-foreground'
        }`}
      >
        {message.body}
      </div>
      <span className="text-[11px] text-muted-foreground px-1">{time}</span>
    </div>
  )
}
