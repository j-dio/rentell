import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const blobId = Number(id)
  if (!Number.isInteger(blobId) || blobId < 1) {
    return new NextResponse('Not found', { status: 404 })
  }

  const rows = await sql<{ data: string; mime_type: string }[]>`
    SELECT data, mime_type FROM image_blob WHERE blob_id = ${blobId}
  `
  if (!rows[0]) return new NextResponse('Not found', { status: 404 })

  const buffer = Buffer.from(rows[0].data, 'base64')

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': rows[0].mime_type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
