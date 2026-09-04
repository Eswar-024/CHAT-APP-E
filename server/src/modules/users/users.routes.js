import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { searchRateLimiter } from "../../middleware/rateLimit.js";
import { getById, search } from "./users.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", searchRateLimiter, search);
router.get("/:id", getById);

export default router;
