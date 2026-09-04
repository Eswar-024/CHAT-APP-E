import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { authRateLimiter } from "../../middleware/rateLimit.js";
import { login, logout, me, register, updateMe } from "./auth.controller.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, updateMe);

export default router;
