import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getConversationForUser,
  getOrCreateConversation,
  listConversations,
  markConversationRead,
  togglePinConversation,
} from "./conversations.service.js";

const uuidSchema = z.string().uuid();
const createSchema = z
  .object({
    peerUserId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    targetUserId: z.string().uuid().optional(),
  })
  .refine((data) => data.peerUserId || data.userId || data.targetUserId, {
    message: "Target user ID is required.",
  });

export const list = asyncHandler(async (req, res) => {
  const conversations = await listConversations(req.user.id);
  res.status(200).json({ conversations });
});

export const create = asyncHandler(async (req, res) => {
  const parsed = createSchema.parse(req.body);
  const targetId = parsed.peerUserId || parsed.userId || parsed.targetUserId;
  const conversation = await getOrCreateConversation(req.user.id, targetId);
  res.status(200).json({ conversation });
});

export const getById = asyncHandler(async (req, res) => {
  const conversationId = uuidSchema.parse(req.params.conversationId);
  const conversation = await getConversationForUser(
    req.user.id,
    conversationId,
  );
  res.status(200).json({ conversation });
});

export const markRead = asyncHandler(async (req, res) => {
  const conversationId = uuidSchema.parse(req.params.conversationId);
  const conversation = await markConversationRead(req.user.id, conversationId);
  res.status(200).json({ conversation });
});

export const togglePin = asyncHandler(async (req, res) => {
  const conversationId = uuidSchema.parse(req.params.conversationId);
  const conversation = await togglePinConversation(req.user.id, conversationId);
  res.status(200).json({ conversation });
});
