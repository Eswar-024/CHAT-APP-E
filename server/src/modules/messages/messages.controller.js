import { asyncHandler } from "../../utils/asyncHandler.js";
import { listMessages, sendMessage } from "./messages.service.js";
import {
  conversationIdSchema,
  listMessagesQuerySchema,
  sendMessageSchema,
} from "./messages.validation.js";

export const list = asyncHandler(async (req, res) => {
  const conversationId = conversationIdSchema.parse(req.params.conversationId);
  const { cursor } = listMessagesQuerySchema.parse(req.query);
  const result = await listMessages(req.user.id, conversationId, cursor);
  res.status(200).json(result);
});

export const create = asyncHandler(async (req, res) => {
  const conversationId = conversationIdSchema.parse(req.params.conversationId);
  const { content } = sendMessageSchema.parse(req.body);
  const message = await sendMessage(req.user.id, conversationId, content);
  res.status(201).json({ message });
});
