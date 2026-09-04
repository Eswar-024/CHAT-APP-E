import { AppError } from "../utils/AppError.js";
import { config } from "../config.js";
import { getCurrentUser } from "../modules/auth/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[config.sessionCookieName];
  if (!token) {
    throw new AppError(401, "Authentication required");
  }

  const { user, sessionId } = await getCurrentUser(token);
  req.user = user;
  req.sessionId = sessionId;
  next();
});
