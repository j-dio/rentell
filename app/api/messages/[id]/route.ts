import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getConversationById, markConversationRead } from '@/lib/queries/messages'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const conversationId = Number(id)
  if (!Number.isInteger(conversationId) || conversationId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const conversation = await getConversationById(conversationId, session.userId)
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 403 })
  }

  await markConversationRead(conversationId, session.userId)

  return NextResponse.json({ ok: true })
}
