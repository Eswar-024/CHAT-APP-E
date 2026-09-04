import { z } from "zod";
import { AppError } from "../../utils/AppError.js";

export const MAX_MESSAGE_LENGTH = 4000;

const uuidSchema = z.string().uuid();

function codePointLength(value) {
  return [...value].length;
}

export function normalizeMessageContent(content) {
  if (typeof content !== "string") {
    throw new AppError(400, "Message must be text");
  }

  const text = content
    .replace(/\0/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const trimmed = text.trim();
  if (!trimmed) {
    throw new AppError(400, "Message cannot be empty");
  }

  if (codePointLength(trimmed) > MAX_MESSAGE_LENGTH) {
    throw new AppError(400, "Message is too long");
  }

  return trimmed;
}

export const sendMessageSchema = z
  .object({
    content: z.string(),
  });

export const conversationIdSchema = uuidSchema;

export const listMessagesQuerySchema = z.object({
  cursor: z.string().trim().min(1).optional(),
});

export function parseMessageCursor(cursor) {
  if (!cursor) return null;

  const separator = cursor.lastIndexOf("|");
  if (separator <= 0 || separator === cursor.length - 1) {
    throw new AppError(400, "Invalid pagination cursor");
  }

  const createdAt = cursor.slice(0, separator);
  const id = cursor.slice(separator + 1);
  const createdAtMs = Date.parse(createdAt);

  if (Number.isNaN(createdAtMs) || !z.string().uuid().safeParse(id).success) {
    throw new AppError(400, "Invalid pagination cursor");
  }

  return { createdAt, id };
}
