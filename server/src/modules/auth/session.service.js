import { query } from "../../db/pool.js";
import { config } from "../../config.js";
import { AppError } from "../../utils/AppError.js";
import { createSessionToken, hashSessionToken } from "./crypto.js";

function parseIp(ip) {
  if (!ip) return null;
  const cleaned = ip.replace(/^::ffff:/, "");
  if (cleaned === "::1") return "127.0.0.1";
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(cleaned) || cleaned.includes(":")) {
    return cleaned;
  }
  return null;
}

export async function createSession({ userId, userAgent, ip }) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + config.sessionTtlMs);

  await query(
    `INSERT INTO sessions (user_id, token_hash, expires_at, user_agent, ip)
     VALUES ($1, $2, $3, $4, $5::inet)`,
    [userId, tokenHash, expiresAt, userAgent ?? null, parseIp(ip)],
  );

  return { token, expiresAt };
}

export async function findValidSession(token) {
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const { rows } = await query(
    `SELECT
       s.id AS session_id,
       s.expires_at,
       s.revoked_at,
       u.id,
       u.username,
       u.display_name,
       u.bio,
       u.avatar_url,
       u.created_at,
       u.updated_at,
       u.last_seen_at
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1`,
    [tokenHash],
  );

  const session = rows[0];
  if (!session) return null;
  if (session.revoked_at) return null;
  if (new Date(session.expires_at) <= new Date()) return null;

  return session;
}

export async function revokeOtherSessions(userId, sessionIdToKeep) {
  if (!userId || !sessionIdToKeep) return;
  await query(
    `UPDATE sessions
     SET revoked_at = now()
     WHERE user_id = $1
       AND revoked_at IS NULL
       AND id <> $2`,
    [userId, sessionIdToKeep],
  );
}

export async function revokeSession(sessionId) {
  if (!sessionId) return;
  await query(
    `UPDATE sessions
     SET revoked_at = now()
     WHERE id = $1
       AND revoked_at IS NULL`,
    [sessionId],
  );
}

export async function requireActiveSession(token) {
  const session = await findValidSession(token);
  if (!session) {
    throw new AppError(401, "Authentication required");
  }
  return session;
}

