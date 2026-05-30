import sql from '@/lib/db'

export type ConversationListItem = {
  conversation_id: number
  other_user_id: number
  other_user_name: string
  housing_id: number | null
  housing_name: string | null
  last_message_body: string | null
  last_message_at: Date | null
  unread_count: number
}

export type ConversationDetail = {
  conversation_id: number
  other_user_id: number
  other_user_name: string
  housing_id: number | null
  housing_name: string | null
}

export type Message = {
  message_id: number
  conversation_id: number
  sender_id: number
  sender_name: string
  body: string
  created_at: Date
  read_at: Date | null
}

export async function getConversationsByUser(userId: number): Promise<ConversationListItem[]> {
  return sql<ConversationListItem[]>`
    SELECT
      c.conversation_id,
      CASE WHEN c.user_one_id = ${userId} THEN c.user_two_id ELSE c.user_one_id END AS other_user_id,
      u.first_name || ' ' || u.last_name                                            AS other_user_name,
      c.housing_id,
      h.name                                                                        AS housing_name,
      lm.body                                                                       AS last_message_body,
      lm.created_at                                                                 AS last_message_at,
      (
        SELECT COUNT(*)::int
        FROM   message m2
        WHERE  m2.conversation_id = c.conversation_id
          AND  m2.sender_id      != ${userId}
          AND  m2.read_at        IS NULL
      )                                                                             AS unread_count
    FROM conversation c
    JOIN users u
      ON u.user_id = CASE WHEN c.user_one_id = ${userId} THEN c.user_two_id ELSE c.user_one_id END
    LEFT JOIN housing h ON h.housing_id = c.housing_id
    LEFT JOIN LATERAL (
      SELECT body, created_at
      FROM   message
      WHERE  conversation_id = c.conversation_id
      ORDER  BY created_at DESC
      LIMIT  1
    ) lm ON true
    WHERE (c.user_one_id = ${userId} OR c.user_two_id = ${userId})
      AND EXISTS (
        SELECT 1 FROM message WHERE conversation_id = c.conversation_id
      )
    ORDER BY lm.created_at DESC NULLS LAST, c.created_at DESC
  `
}

export async function getConversationById(
  conversationId: number,
  userId: number,
): Promise<ConversationDetail | null> {
  const rows = await sql<ConversationDetail[]>`
    SELECT
      c.conversation_id,
      CASE WHEN c.user_one_id = ${userId} THEN c.user_two_id ELSE c.user_one_id END AS other_user_id,
      u.first_name || ' ' || u.last_name                                            AS other_user_name,
      c.housing_id,
      h.name                                                                        AS housing_name
    FROM conversation c
    JOIN users u
      ON u.user_id = CASE WHEN c.user_one_id = ${userId} THEN c.user_two_id ELSE c.user_one_id END
    LEFT JOIN housing h ON h.housing_id = c.housing_id
    WHERE c.conversation_id = ${conversationId}
      AND (c.user_one_id = ${userId} OR c.user_two_id = ${userId})
  `
  return rows[0] ?? null
}

export async function getMessagesByConversation(conversationId: number): Promise<Message[]> {
  return sql<Message[]>`
    SELECT
      m.message_id,
      m.conversation_id,
      m.sender_id,
      u.first_name || ' ' || u.last_name AS sender_name,
      m.body,
      m.created_at,
      m.read_at
    FROM message m
    JOIN users u ON u.user_id = m.sender_id
    WHERE m.conversation_id = ${conversationId}
    ORDER BY m.created_at ASC
  `
}

// Always enforces CHECK (user_one_id < user_two_id) by sorting before insert.
// Uses ON CONFLICT DO NOTHING + fallback SELECT for atomicity — prevents a 500
// crash when two concurrent requests race to create the same conversation.
// IS NOT DISTINCT FROM used in the fallback SELECT so NULL housing_id matches correctly
// (per MISTAKES.md: UNIQUE with nullable columns requires IS NOT DISTINCT FROM).
export async function getOrCreateConversation(
  userAId: number,
  userBId: number,
  housingId: number | null,
): Promise<{ conversation_id: number }> {
  const userOneId = Math.min(userAId, userBId)
  const userTwoId = Math.max(userAId, userBId)

  // Attempt insert; silently ignore if the unique constraint fires (concurrent request).
  const inserted = await sql<{ conversation_id: number }[]>`
    INSERT INTO conversation (user_one_id, user_two_id, housing_id)
    VALUES (${userOneId}, ${userTwoId}, ${housingId})
    ON CONFLICT (user_one_id, user_two_id, housing_id) DO NOTHING
    RETURNING conversation_id
  `
  if (inserted[0]) return inserted[0]

  // Conflict occurred — row already exists; fetch it.
  const rows = await sql<{ conversation_id: number }[]>`
    SELECT conversation_id
    FROM   conversation
    WHERE  user_one_id = ${userOneId}
      AND  user_two_id = ${userTwoId}
      AND  housing_id IS NOT DISTINCT FROM ${housingId}
  `
  return rows[0]
}

// Returns undefined if senderId is not a participant (caller maps this to 403).
export async function sendMessage(
  conversationId: number,
  senderId: number,
  body: string,
): Promise<{ message_id: number } | undefined> {
  const participation = await sql<{ conversation_id: number }[]>`
    SELECT conversation_id
    FROM   conversation
    WHERE  conversation_id = ${conversationId}
      AND  (user_one_id = ${senderId} OR user_two_id = ${senderId})
  `
  if (!participation[0]) return undefined

  const rows = await sql<{ message_id: number }[]>`
    INSERT INTO message (conversation_id, sender_id, body)
    VALUES (${conversationId}, ${senderId}, ${body})
    RETURNING message_id
  `
  return rows[0]
}

// Marks all unread messages in the conversation as read, excluding the reader's own messages.
// Safe to call on every render — idempotent (WHERE read_at IS NULL is a no-op on already-read rows).
export async function markConversationRead(
  conversationId: number,
  readerId: number,
): Promise<void> {
  await sql`
    UPDATE message
    SET    read_at = now()
    WHERE  conversation_id = ${conversationId}
      AND  sender_id      != ${readerId}
      AND  read_at        IS NULL
  `
}

export async function getUnreadCount(userId: number): Promise<number> {
  const rows = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM   message m
    JOIN   conversation c ON c.conversation_id = m.conversation_id
    WHERE  (c.user_one_id = ${userId} OR c.user_two_id = ${userId})
      AND  m.sender_id != ${userId}
      AND  m.read_at   IS NULL
  `
  return Number(rows[0]?.count ?? 0)
}
