import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { messageRateLimiter } from "../../middleware/rateLimit.js";
import {
  create,
  getById,
  list,
  markRead,
  togglePin,
} from "./conversations.controller.js";
import {
  create as createMessage,
  list as listMessages,
} from "../messages/messages.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", list);
router.post("/", create);
router.get("/:conversationId", getById);
router.put("/:conversationId/read", markRead);
router.put("/:conversationId/pin", togglePin);
router.get("/:conversationId/messages", listMessages);
router.post("/:conversationId/messages", messageRateLimiter, createMessage);

export default router;
