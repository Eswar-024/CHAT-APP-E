import { pool, query } from "../../db/pool.js";
import { AppError } from "../../utils/AppError.js";
import { toPublicUser } from "../../utils/publicUser.js";

function orderedPair(userA, userB) {
  return userA < userB ? [userA, userB] : [userB, userA];
}

function mapConversation(row, currentUserId) {
  const peer =
    row.peer_id === currentUserId
      ? null
      : toPublicUser({
          id: row.peer_id,
          username: row.peer_username,
          display_name: row.peer_display_name,
          bio: row.peer_bio,
          avatar_url: row.peer_avatar_url,
          created_at: row.peer_created_at,
          updated_at: row.peer_updated_at,
          last_seen_at: row.peer_last_seen_at,
        });

  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_message_at: row.last_message_at,
    last_read_at: row.last_read_at,
    is_pinned: row.is_pinned,
    unread_count: Number(row.unread_count || 0),
    last_message: row.last_message_id
      ? {
          id: row.last_message_id,
          content: row.last_message_deleted_at ? "" : row.last_message_content,
          sender_id: row.last_message_sender_id,
          created_at: row.last_message_created_at,
          deleted_at: row.last_message_deleted_at,
        }
      : null,
    peer,
  };
}

const CONVERSATION_SELECT = `
  SELECT
    c.id,
    c.created_at,
    c.updated_at,
    c.last_message_at,
    me.last_read_at,
    me.is_pinned,
    peer.user_id AS peer_id,
    u.username AS peer_username,
    u.display_name AS peer_display_name,
    u.bio AS peer_bio,
    u.avatar_url AS peer_avatar_url,
    u.created_at AS peer_created_at,
    u.updated_at AS peer_updated_at,
    u.last_seen_at AS peer_last_seen_at,
    lm.id AS last_message_id,
    lm.content AS last_message_content,
    lm.sender_id AS last_message_sender_id,
    lm.created_at AS last_message_created_at,
    lm.deleted_at AS last_message_deleted_at,
    (
      SELECT COUNT(*)::int
      FROM messages msg
      WHERE msg.conversation_id = c.id
        AND msg.deleted_at IS NULL
        AND msg.sender_id <> $1
        AND (me.last_read_at IS NULL OR msg.created_at > me.last_read_at)
    ) AS unread_count
  FROM conversations c
  INNER JOIN conversation_members me
    ON me.conversation_id = c.id AND me.user_id = $1
  INNER JOIN conversation_members peer
    ON peer.conversation_id = c.id AND peer.user_id <> $1
  INNER JOIN users u ON u.id = peer.user_id
  LEFT JOIN LATERAL (
    SELECT id, content, sender_id, created_at, deleted_at
    FROM messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  ) lm ON true
`;

export async function requireMembership(userId, conversationId) {
  const { rows } = await query(
    `SELECT 1
     FROM conversation_members
     WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId],
  );

  if (!rows[0]) {
    throw new AppError(404, "Conversation not found");
  }
}

export async function getConversationForUser(userId, conversationId) {
  await requireMembership(userId, conversationId);

  const { rows } = await query(`${CONVERSATION_SELECT} WHERE c.id = $2`, [
    userId,
    conversationId,
  ]);

  if (!rows[0]) {
    throw new AppError(404, "Conversation not found");
  }

  return mapConversation(rows[0], userId);
}

export async function listConversations(userId) {
  const { rows } = await query(
    `${CONVERSATION_SELECT}
     ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC`,
    [userId],
  );

  return rows.map((row) => mapConversation(row, userId));
}

export async function getOrCreateConversation(userId, peerUserId) {
  if (userId === peerUserId) {
    throw new AppError(400, "You cannot start a conversation with yourself.");
  }

  const { rows: peerRows } = await query(`SELECT id FROM users WHERE id = $1`, [
    peerUserId,
  ]);
  if (!peerRows[0]) {
    throw new AppError(404, "User not found");
  }

  const [low, high] = orderedPair(userId, peerUserId);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const inserted = await client.query(
      `INSERT INTO conversations (user_low_id, user_high_id)
       VALUES ($1, $2)
       ON CONFLICT (user_low_id, user_high_id) DO NOTHING
       RETURNING id`,
      [low, high],
    );

    let conversationId = inserted.rows[0]?.id;
    if (!conversationId) {
      const existing = await client.query(
        `SELECT id FROM conversations WHERE user_low_id = $1 AND user_high_id = $2`,
        [low, high],
      );
      conversationId = existing.rows[0].id;
    }

    await client.query(
      `INSERT INTO conversation_members (conversation_id, user_id)
       VALUES ($1, $2), ($1, $3)
       ON CONFLICT (conversation_id, user_id) DO NOTHING`,
      [conversationId, low, high],
    );

    await client.query("COMMIT");
    return getConversationForUser(userId, conversationId);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function markConversationRead(userId, conversationId) {
  await requireMembership(userId, conversationId);

  await query(
    `UPDATE conversation_members
     SET last_read_at = now()
     WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId],
  );

  const { rows: latest } = await query(
    `SELECT id FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [conversationId],
  );

  if (latest[0]) {
    await query(
      `INSERT INTO message_reads (message_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (message_id, user_id) DO UPDATE SET read_at = now()`,
      [latest[0].id, userId],
    );
  }

  return getConversationForUser(userId, conversationId);
}

export async function togglePinConversation(userId, conversationId) {
  await requireMembership(userId, conversationId);

  await query(
    `UPDATE conversation_members
     SET is_pinned = NOT is_pinned
     WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId],
  );

  return getConversationForUser(userId, conversationId);
}

