import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { createReview } from '@/lib/queries/reviews'

const createReviewSchema = z.object({
  listing_type: z.enum(['housing', 'carinderia']),
  listing_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).nullable().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { listing_type, listing_id, rating, comment } = parsed.data

  try {
    const result = await createReview(session.userId, listing_type, listing_id, rating, comment)
    return NextResponse.json(result, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('review_xor_check')) {
      return NextResponse.json({ error: 'Invalid listing reference' }, { status: 400 })
    }
    throw err
  }
}
