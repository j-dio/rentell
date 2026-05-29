import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { sendMessage } from '@/lib/queries/messages'

const sendMessageSchema = z.object({
  conversation_id: z.number().int().positive(),
  body:            z.string().trim().min(1).max(4000),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = sendMessageSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const result = await sendMessage(
    parsed.data.conversation_id,
    session.userId,
    parsed.data.body,
  )

  if (!result) {
    return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 403 })
  }

  return NextResponse.json(result, { status: 201 })
}
