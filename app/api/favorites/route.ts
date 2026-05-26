import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/session'
import { addFavorite, removeFavorite } from '@/lib/queries/favorites'

const favoriteSchema = z.object({
  listing_type: z.enum(['housing', 'carinderia']),
  listing_id: z.number().int().positive(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = favoriteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { listing_type, listing_id } = parsed.data

  try {
    const result = await addFavorite(session.userId, listing_type, listing_id)
    return NextResponse.json(result, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('unique')) {
      return NextResponse.json({ error: 'Already favorited' }, { status: 409 })
    }
    throw err
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = favoriteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { listing_type, listing_id } = parsed.data

  const result = await removeFavorite(session.userId, listing_type, listing_id)
  if (!result) {
    return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
  }

  return NextResponse.json(result)
}
