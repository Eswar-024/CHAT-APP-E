import { query } from "../../db/pool.js";
import { requireMembership } from "../conversations/conversations.service.js";
import { emitToConversation, emitToUser } from "../../realtime/socket.js";
import {
  normalizeMessageContent,
  parseMessageCursor,
} from "./messages.validation.js";

const PAGE_SIZE = 25;

function toIso(value) {
  if (value instanceof Date) return value.toISOString();
  return value;
}

function toMessage(row) {
  return {
    id: row.id,
    conversation_id: row.conversation_id,
    sender_id: row.sender_id,
    content: row.deleted_at ? "" : row.content,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
    edited_at: row.edited_at ? toIso(row.edited_at) : null,
    deleted_at: row.deleted_at ? toIso(row.deleted_at) : null,
  };
}

export async function listMessages(userId, conversationId, cursor) {
  await requireMembership(userId, conversationId);

  const params = [conversationId, PAGE_SIZE + 1];
  let sql = `
    SELECT id, conversation_id, sender_id, content, created_at, updated_at, edited_at, deleted_at
    FROM messages
    WHERE conversation_id = $1
  `;

  const parsedCursor = parseMessageCursor(cursor);
  if (parsedCursor) {
    params.push(parsedCursor.createdAt, parsedCursor.id);
    sql += ` AND (created_at, id) < ($3::timestamptz, $4::uuid)`;
  }

  sql += ` ORDER BY created_at DESC, id DESC LIMIT $2`;

  const { rows } = await query(sql, params);
  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const chronological = page.reverse().map(toMessage);
  const oldest = chronological[0];
  let nextCursor = null;
  if (hasMore && oldest) {
    nextCursor = `${oldest.created_at}|${oldest.id}`;
  }

  return { messages: chronological, nextCursor };
}

export async function sendMessage(userId, conversationId, content) {
  await requireMembership(userId, conversationId);

  const text = normalizeMessageContent(content);

  const { rows } = await query(
    `INSERT INTO messages (conversation_id, sender_id, content)
     VALUES ($1, $2, $3)
     RETURNING id, conversation_id, sender_id, content, created_at, updated_at, edited_at, deleted_at`,
    [conversationId, userId, text],
  );

  await query(
    `UPDATE conversations
     SET last_message_at = $2, updated_at = now()
     WHERE id = $1`,
    [conversationId, rows[0].created_at],
  );

  const message = toMessage(rows[0]);
  const payload = { message, conversationId };

  emitToConversation(conversationId, "message:created", payload);

  const { rows: members } = await query(
    `SELECT user_id FROM conversation_members WHERE conversation_id = $1`,
    [conversationId],
  );
  for (const member of members) {
    emitToUser(member.user_id, "conversation:updated", {
      conversationId,
      last_message: message,
    });
  }

  return message;
}
