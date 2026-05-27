import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { createCarinderia } from '@/lib/queries/carinderia'

const createCarinderiaSchema = z.object({
  name: z.string().trim().min(1).max(100),
  address: z.string().trim().min(1),
  description: z.string().trim().nullable().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createCarinderiaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const result = await createCarinderia(session.userId, parsed.data)
  return NextResponse.json(result, { status: 201 })
}
