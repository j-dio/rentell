import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import sql from '@/lib/db'

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await sql`
    UPDATE users
    SET is_host    = NOT is_host,
        updated_at = now()
    WHERE user_id = ${session.userId}
  `

  return NextResponse.json({ success: true })
}
