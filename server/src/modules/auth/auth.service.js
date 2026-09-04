import { query } from "../../db/pool.js";
import { AppError } from "../../utils/AppError.js";
import { hashPassword, verifyPassword } from "./crypto.js";
import { normalizeUsername } from "./auth.validation.js";
import { createSession, requireActiveSession, revokeOtherSessions, revokeSession } from "./session.service.js";

const GENERIC_AUTH_ERROR = "Invalid username or password.";

let dummyPasswordHashPromise;

function getDummyPasswordHash() {
  if (!dummyPasswordHashPromise) {
    dummyPasswordHashPromise = hashPassword("timing-safe-dummy-password");
  }
  return dummyPasswordHashPromise;
}

function toPublicUser(row) {
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    bio: row.bio,
    avatar_url: row.avatar_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_seen_at: row.last_seen_at,
  };
}

const USER_COLUMNS = `
  id, username, display_name, bio, avatar_url, created_at, updated_at, last_seen_at
`;

export async function registerUser({ username, display_name, password, bio }, meta) {
  const passwordHash = await hashPassword(password);
  const usernameNormalized = normalizeUsername(username);

  let user;
  try {
    const { rows } = await query(
      `INSERT INTO users (username, username_normalized, display_name, password_hash, bio)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${USER_COLUMNS}`,
      [username.trim(), usernameNormalized, display_name, passwordHash, bio],
    );
    user = rows[0];
  } catch (err) {
    if (err.code === "23505") {
      throw new AppError(409, "Username is already taken.");
    }
    throw err;
  }

  const { token } = await createSession({
    userId: user.id,
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return { user: toPublicUser(user), token };
}

export async function loginUser({ username, password }, meta) {
  const usernameNormalized = normalizeUsername(username);
  const { rows } = await query(
    `SELECT ${USER_COLUMNS}, password_hash
     FROM users
     WHERE username_normalized = $1`,
    [usernameNormalized],
  );

  const user = rows[0];
  const passwordHash = user?.password_hash ?? (await getDummyPasswordHash());
  const passwordOk = await verifyPassword(password, passwordHash);

  if (!user || !passwordOk) {
    throw new AppError(401, GENERIC_AUTH_ERROR);
  }

  const { token } = await createSession({
    userId: user.id,
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  await query(`UPDATE users SET last_seen_at = now() WHERE id = $1`, [user.id]).catch(() => {});

  return { user: toPublicUser(user), token };
}

export async function logoutUser(sessionId) {
  await revokeSession(sessionId);
}

export async function updateOwnProfile(userId, patch, extras = {}) {
  const { currentPassword, currentSessionId } = extras;

  if (patch.password !== undefined) {
    if (!currentPassword) {
      throw new AppError(400, "Current password is required.");
    }

    const { rows: secretRows } = await query(
      `SELECT password_hash FROM users WHERE id = $1`,
      [userId],
    );
    const existingHash = secretRows[0]?.password_hash;
    if (!existingHash) {
      throw new AppError(401, "Authentication required");
    }

    const passwordOk = await verifyPassword(currentPassword, existingHash);
    if (!passwordOk) {
      throw new AppError(401, "Current password is incorrect.");
    }
  }
  const fields = [];
  const values = [];
  let index = 1;

  if (patch.username !== undefined) {
    fields.push(`username = $${index++}`);
    values.push(patch.username.trim());
    fields.push(`username_normalized = $${index++}`);
    values.push(normalizeUsername(patch.username));
  }

  if (patch.display_name !== undefined) {
    fields.push(`display_name = $${index++}`);
    values.push(patch.display_name);
  }

  if (patch.bio !== undefined) {
    fields.push(`bio = $${index++}`);
    values.push(patch.bio === "" ? null : patch.bio);
  }

  if (patch.password !== undefined) {
    fields.push(`password_hash = $${index++}`);
    values.push(await hashPassword(patch.password));
  }

  if (fields.length === 0) {
    throw new AppError(400, "No valid fields to update");
  }

  values.push(userId);

  try {
    const { rows } = await query(
      `UPDATE users
       SET ${fields.join(", ")}
       WHERE id = $${index}
       RETURNING ${USER_COLUMNS}`,
      values,
    );
    if (!rows[0]) {
      throw new AppError(401, "Authentication required");
    }

    if (patch.password !== undefined) {
      if (!currentSessionId) {
        throw new AppError(401, "Authentication required");
      }
      await revokeOtherSessions(userId, currentSessionId);
    }

    return toPublicUser(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      throw new AppError(409, "Username is already taken.");
    }
    throw err;
  }
}

export async function getCurrentUser(token) {
  const session = await requireActiveSession(token);
  return {
    user: toPublicUser(session),
    sessionId: session.session_id,
  };
}
