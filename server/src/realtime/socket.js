import { Server } from "socket.io";
import { config } from "../config.js";
import { parseCookies } from "../utils/parseCookies.js";
import { findValidSession } from "../modules/auth/session.service.js";
import { requireMembership } from "../modules/conversations/conversations.service.js";
import { query } from "../db/pool.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let io;
const activeUserSockets = new Map();

export function isUserOnline(userId) {
  if (!userId) return false;
  return (activeUserSockets.get(userId)?.size || 0) > 0;
}

function conversationRooms(socket) {
  return [...socket.rooms].filter((room) => room.startsWith("conversation:"));
}

export function attachSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.clientOrigins,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const origin = socket.handshake.headers.origin;
      if (config.isProduction && !origin) {
        next(new Error("Forbidden"));
        return;
      }
      if (origin && !config.clientOrigins.includes(origin)) {
        next(new Error("Forbidden"));
        return;
      }

      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies[config.sessionCookieName];
      const session = await findValidSession(token);
      if (!session) {
        next(new Error("Authentication required"));
        return;
      }
      socket.userId = session.id;
      socket.sessionId = session.session_id;
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    let userSockets = activeUserSockets.get(socket.userId);
    if (!userSockets) {
      userSockets = new Set();
      activeUserSockets.set(socket.userId, userSockets);
    }
    userSockets.add(socket.id);

    socket.on("join:conversation", async (conversationId, ack) => {
      try {
        if (!UUID_RE.test(conversationId)) {
          ack?.({ ok: false });
          return;
        }

        await requireMembership(socket.userId, conversationId);

        for (const room of conversationRooms(socket)) {
          if (room !== `conversation:${conversationId}`) {
            socket.leave(room);
          }
        }

        socket.join(`conversation:${conversationId}`);
        ack?.({ ok: true });
      } catch {
        ack?.({ ok: false });
      }
    });

    socket.on("leave:conversation", (conversationId) => {
      if (typeof conversationId === "string") {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    socket.on("disconnect", async () => {
      const sockets = activeUserSockets.get(socket.userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          activeUserSockets.delete(socket.userId);
          await query("UPDATE users SET last_seen_at = now() WHERE id = $1", [
            socket.userId,
          ]).catch(() => {});
        }
      }
    });
  });

  return io;
}

export function emitToConversation(conversationId, event, payload) {
  io?.to(`conversation:${conversationId}`).emit(event, payload);
}

export function emitToUser(userId, event, payload) {
  io?.to(`user:${userId}`).emit(event, payload);
}

export async function disconnectSocketsBySession(sessionId) {
  if (!io || !sessionId) return;

  const sockets = await io.fetchSockets();
  await Promise.all(
    sockets
      .filter((socket) => socket.sessionId === sessionId)
      .map((socket) => socket.disconnect(true)),
  );
}

export async function disconnectSocketsForUserExcept(userId, sessionId) {
  if (!io || !userId || !sessionId) return;

  const sockets = await io.fetchSockets();
  await Promise.all(
    sockets
      .filter(
        (socket) => socket.userId === userId && socket.sessionId !== sessionId,
      )
      .map((socket) => socket.disconnect(true)),
  );
}
