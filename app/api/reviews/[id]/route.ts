import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { updateReview, deleteReview } from '@/lib/queries/reviews'

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).nullable().optional(),
})

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const reviewId = Number(id)
  if (!Number.isInteger(reviewId) || reviewId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json()
  const parsed = updateReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const result = await updateReview(reviewId, session.userId, parsed.data.rating, parsed.data.comment)
  if (!result) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const reviewId = Number(id)
  if (!Number.isInteger(reviewId) || reviewId < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const deleted = await deleteReview(reviewId, session.userId)
  if (!deleted) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 })

  return NextResponse.json({ success: true })
}
