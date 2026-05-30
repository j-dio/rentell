import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import sql from '@/lib/db'

const schema = z.object({
  phone_number: z.string().max(20).nullable().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await sql`
    UPDATE users
    SET phone_number         = ${parsed.data.phone_number ?? null},
        onboarding_completed = true,
        updated_at           = now()
    WHERE user_id = ${session.userId}
  `

  return NextResponse.json({ success: true })
}
