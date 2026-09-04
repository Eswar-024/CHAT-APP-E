import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getPublicUserById, searchUsers } from "./users.service.js";

const searchSchema = z.object({
  q: z.string().optional().default(""),
});

const userIdSchema = z.string().uuid();

export const search = asyncHandler(async (req, res) => {
  const parsed = searchSchema.safeParse(req.query);
  const q = parsed.success ? parsed.data.q : "";
  const users = await searchUsers(req.user.id, q);
  res.status(200).json({ users });
});

export const getById = asyncHandler(async (req, res) => {
  const userId = userIdSchema.parse(req.params.id);
  const user = await getPublicUserById(userId);
  res.status(200).json({ user });
});
