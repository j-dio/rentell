import sql from '@/lib/db'

export type Review = {
  review_id: number
  reviewer_id: number
  reviewer_name: string
  rating: number
  comment: string | null
  created_at: Date
  updated_at: Date
}

export async function getReviewsByHousing(housingId: number): Promise<Review[]> {
  return sql<Review[]>`
    SELECT
      r.review_id,
      r.reviewer_id,
      u.first_name || ' ' || u.last_name AS reviewer_name,
      r.rating,
      r.comment,
      r.created_at,
      r.updated_at
    FROM review r
    JOIN users u ON u.user_id = r.reviewer_id
    WHERE r.housing_id    = ${housingId}
      AND r.listing_type  = 'housing'
    ORDER BY r.created_at DESC
  `
}

export async function getReviewsByCarinderia(carinderia_id: number): Promise<Review[]> {
  return sql<Review[]>`
    SELECT
      r.review_id,
      r.reviewer_id,
      u.first_name || ' ' || u.last_name AS reviewer_name,
      r.rating,
      r.comment,
      r.created_at,
      r.updated_at
    FROM review r
    JOIN users u ON u.user_id = r.reviewer_id
    WHERE r.carinderia_id = ${carinderia_id}
      AND r.listing_type  = 'carinderia'
    ORDER BY r.created_at DESC
  `
}

export async function createReview(
  reviewerId: number,
  listingType: 'housing' | 'carinderia',
  listingId: number,
  rating: number,
  comment?: string | null,
) {
  const housingId    = listingType === 'housing'    ? listingId : null
  const carinderia_id = listingType === 'carinderia' ? listingId : null

  const rows = await sql<{ review_id: number }[]>`
    INSERT INTO review (reviewer_id, listing_type, housing_id, carinderia_id, rating, comment)
    VALUES (${reviewerId}, ${listingType}, ${housingId}, ${carinderia_id}, ${rating}, ${comment ?? null})
    RETURNING review_id
  `
  return rows[0]
}

export async function updateReview(
  reviewId: number,
  reviewerId: number,
  rating: number,
  comment?: string | null,
) {
  const rows = await sql<{ review_id: number }[]>`
    UPDATE review
    SET rating     = ${rating},
        comment    = ${comment ?? null},
        updated_at = now()
    WHERE review_id   = ${reviewId}
      AND reviewer_id = ${reviewerId}
    RETURNING review_id
  `
  return rows[0] as { review_id: number } | undefined
}

export async function deleteReview(reviewId: number, reviewerId: number) {
  const rows = await sql<{ review_id: number }[]>`
    DELETE FROM review
    WHERE review_id   = ${reviewId}
      AND reviewer_id = ${reviewerId}
    RETURNING review_id
  `
  return rows[0] as { review_id: number } | undefined
}
