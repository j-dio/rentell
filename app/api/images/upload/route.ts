import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import sql from '@/lib/db'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' },
      { status: 400 },
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File must be 5 MB or smaller' }, { status: 400 })
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')

  const rows = await sql<{ blob_id: number }[]>`
    INSERT INTO image_blob (data, mime_type, size_bytes)
    VALUES (${base64}, ${file.type}, ${file.size})
    RETURNING blob_id
  `

  return NextResponse.json({ url: `/api/images/${rows[0].blob_id}` }, { status: 201 })
}
