import { loginSchema, registerSchema, updateMeSchema } from "./auth.validation.js";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateOwnProfile,
} from "./auth.service.js";
import { config } from "../../config.js";
import { clientIp, clearSessionCookie, setSessionCookie } from "../../utils/cookies.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { disconnectSocketsBySession, disconnectSocketsForUserExcept } from "../../realtime/socket.js";

function requestMeta(req) {
  return {
    userAgent: req.get("user-agent"),
    ip: clientIp(req),
  };
}

export const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const { user, token } = await registerUser(input, requestMeta(req));
  setSessionCookie(res, token);
  res.status(201).json({ user });
});

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const { user, token } = await loginUser(input, requestMeta(req));
  setSessionCookie(res, token);
  res.status(200).json({ user });
});

export const logout = asyncHandler(async (req, res) => {
  const sessionId = req.sessionId;
  if (sessionId) {
    await logoutUser(sessionId).catch(() => {});
    await disconnectSocketsBySession(sessionId).catch(() => {});
  } else {
    const token = req.cookies?.[config.sessionCookieName];
    if (token) {
      try {
        const { sessionId: sId } = await getCurrentUser(token);
        if (sId) {
          await logoutUser(sId).catch(() => {});
          await disconnectSocketsBySession(sId).catch(() => {});
        }
      } catch {
        /* ignore invalid token on logout */
      }
    }
  }
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const input = updateMeSchema.parse(req.body);
  const { current_password, ...patch } = input;
  const user = await updateOwnProfile(req.user.id, patch, {
    currentPassword: current_password,
    currentSessionId: req.sessionId,
  });
  if (patch.password !== undefined) {
    await disconnectSocketsForUserExcept(req.user.id, req.sessionId);
  }
  res.status(200).json({ user });
});
