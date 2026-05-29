import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { getOrCreateConversation } from '@/lib/queries/messages'

const createConversationSchema = z.object({
  recipient_id: z.number().int().positive(),
  housing_id:   z.number().int().positive().nullable().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createConversationSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { recipient_id, housing_id } = parsed.data

  if (session.userId === recipient_id) {
    return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
  }

  const { conversation_id } = await getOrCreateConversation(
    session.userId,
    recipient_id,
    housing_id ?? null,
  )

  return NextResponse.json({ conversation_id }, { status: 201 })
}
