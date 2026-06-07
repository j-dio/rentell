import { notFound } from 'next/navigation'
import { redirectToSignUp } from '@/lib/auth-redirect'
import { getSession } from '@/lib/session'
import {
  getConversationById,
  getMessagesByConversation,
  markConversationRead,
} from '@/lib/queries/messages'
import MessageThread from '@/components/MessageThread'

export const dynamic = 'force-dynamic'

type Props = { params: { id: string } }

export default async function ThreadPage({ params }: Props) {
  const conversationId = Number(params.id)
  if (!Number.isInteger(conversationId) || conversationId < 1) notFound()

  const session = await getSession()
  if (!session) redirectToSignUp(`/messages/${conversationId}`)

  // Auth check first — messages are only fetched once participation is confirmed.
  const conversation = await getConversationById(conversationId, session.userId)
  if (!conversation) notFound()

  const messages = await getMessagesByConversation(conversationId)

  // Mark incoming messages as read on every render — idempotent, safe with polling.
  await markConversationRead(conversationId, session.userId)

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <MessageThread
        conversationId={conversationId}
        currentUserId={session.userId}
        otherUserName={conversation.other_user_name}
        housingId={conversation.housing_id}
        housingName={conversation.housing_name}
        initialMessages={messages}
      />
    </main>
  )
}
