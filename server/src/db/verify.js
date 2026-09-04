import { query } from "./pool.js";

const REQUIRED_TABLES = [
  "users",
  "sessions",
  "conversations",
  "conversation_members",
  "messages",
  "message_reads",
];

function databaseHostLabel(connectionString) {
  try {
    const parsed = new URL(connectionString);
    const port = parsed.port || "5432";
    return `${parsed.hostname}:${port}`;
  } catch {
    return "unparsed";
  }
}

export async function verifyDatabaseConnection(connectionString) {
  const { rows } = await query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])`,
    [REQUIRED_TABLES],
  );

  const found = new Set(rows.map((row) => row.table_name));
  const missing = REQUIRED_TABLES.filter((name) => !found.has(name));

  if (missing.length > 0) {
    throw new Error(`Database is missing tables: ${missing.join(", ")}`);
  }

  await query(
    `SELECT id, username, username_normalized, display_name, password_hash,
            bio, avatar_url, created_at, updated_at, last_seen_at
     FROM users
     LIMIT 0`,
  );
  await query(
    `SELECT id, user_id, token_hash, created_at, expires_at, revoked_at, user_agent, ip
     FROM sessions
     LIMIT 0`,
  );
  await query(
    `SELECT id, user_low_id, user_high_id, created_at, updated_at, last_message_at
     FROM conversations
     LIMIT 0`,
  );
  await query(
    `SELECT conversation_id, user_id, joined_at, is_pinned, last_read_at
     FROM conversation_members
     LIMIT 0`,
  );
  await query(
    `SELECT id, conversation_id, sender_id, content, created_at, updated_at, edited_at, deleted_at
     FROM messages
     LIMIT 0`,
  );
  await query(
    `SELECT message_id, user_id, read_at
     FROM message_reads
     LIMIT 0`,
  );

  return { host: databaseHostLabel(connectionString) };
}

export function safeDatabaseError(err) {
  if (err?.message?.startsWith("Database is missing tables:")) {
    return err.message;
  }

  if (
    err?.code === "ECONNREFUSED" ||
    err?.code === "ENOTFOUND" ||
    err?.code === "ETIMEDOUT" ||
    err?.code === "EAI_AGAIN"
  ) {
    return "Could not reach PostgreSQL. Set DATABASE_URL in server/.env to the new Supabase connection URI.";
  }

  return "PostgreSQL connection or schema check failed.";
}
