import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getUnreadCount } from '@/lib/queries/messages'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ count: 0 })

  const count = await getUnreadCount(session.userId)
  return NextResponse.json({ count })
}
