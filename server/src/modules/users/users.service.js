import { query } from "../../db/pool.js";
import { AppError } from "../../utils/AppError.js";
import { toPublicUser } from "../../utils/publicUser.js";

export async function searchUsers(currentUserId, rawQuery) {
  const needle = (rawQuery || "").trim().toLowerCase();
  if (needle.length < 2) {
    return [];
  }

  const escaped = needle.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");

  const { rows } = await query(
    `SELECT id, username, display_name, bio, avatar_url, created_at, updated_at, last_seen_at
     FROM users
     WHERE id <> $1
       AND (
         username_normalized LIKE '%' || $2 || '%' ESCAPE '\\'
         OR lower(display_name) LIKE '%' || $2 || '%' ESCAPE '\\'
       )
     ORDER BY username_normalized
     LIMIT 25`,
    [currentUserId, escaped],
  );

  return rows.map(toPublicUser);
}

export async function getPublicUserById(userId) {
  const { rows } = await query(
    `SELECT id, username, display_name, bio, avatar_url, created_at, updated_at, last_seen_at
     FROM users
     WHERE id = $1`,
    [userId],
  );

  const user = rows[0];
  if (!user) {
    throw new AppError(404, "User not found");
  }

  return toPublicUser(user);
}
