import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import sql from '@/lib/db'

const schema = z.object({
  first_name:   z.string().trim().min(1).max(50),
  last_name:    z.string().trim().min(1).max(50),
  phone_number: z.string().trim().max(20).nullable().optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { first_name, last_name, phone_number } = parsed.data

  try {
    await sql`
      UPDATE users
      SET first_name   = ${first_name},
          last_name    = ${last_name},
          phone_number = ${phone_number ?? null},
          updated_at   = now()
      WHERE user_id = ${session.userId}
    `
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}
