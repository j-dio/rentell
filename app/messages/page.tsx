import { redirectToSignUp } from '@/lib/auth-redirect'
import { getSession } from '@/lib/session'
import { getConversationsByUser } from '@/lib/queries/messages'
import ConversationList from '@/components/ConversationList'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const session = await getSession()
  if (!session) redirectToSignUp('/messages')

  const conversations = await getConversationsByUser(session.userId)

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Messages</h1>
      <ConversationList conversations={conversations} />
    </main>
  )
}
