-- 0001_initial_schema.sql
-- Application-owned chat schema for a new/empty Supabase PostgreSQL database.
--
-- Auth model:
--   Express owns username + password sessions.
--   This schema does NOT use auth.users, Supabase Auth, email, OTP, or OAuth.
--
-- Access model:
--   The browser must not connect to Postgres/PostgREST.
--   RLS is enabled with no anon/authenticated policies (default deny).
--   Direct DATABASE_URL (postgres) / service_role stay on the Express server only.
--
-- Safe to apply once on an empty public schema. Does not DROP objects.
-- Does not insert sample users or messages.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Timestamp helper
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ===========================================================================
-- USERS
-- password_hash is stored only here. APIs must never return it to the browser.
-- ===========================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  username_normalized TEXT NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ,
  CONSTRAINT users_username_normalized_key UNIQUE (username_normalized),
  CONSTRAINT users_username_format CHECK (
    username ~ '^[A-Za-z0-9_-]{4,30}$'
  ),
  CONSTRAINT users_display_name_length CHECK (
    char_length(btrim(display_name)) BETWEEN 1 AND 70
  ),
  CONSTRAINT users_bio_length CHECK (
    bio IS NULL OR char_length(bio) <= 140
  )
);

CREATE OR REPLACE FUNCTION set_user_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.username := btrim(NEW.username);
  NEW.display_name := btrim(NEW.display_name);
  NEW.username_normalized := lower(NEW.username);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_set_defaults
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_defaults();

-- UNIQUE (username_normalized) already provides the case-insensitive lookup index.

-- ===========================================================================
-- SESSIONS
-- Required by the existing Express cookie session layer.
-- ===========================================================================

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip INET,
  CONSTRAINT sessions_token_hash_key UNIQUE (token_hash)
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);

-- ===========================================================================
-- CONVERSATIONS
-- Canonical pair: user_low_id < user_high_id (UUID text/byte order).
-- A-B and B-A collapse to one row. Equal IDs (self-chat) fail the CHECK.
-- ===========================================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_low_id UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  user_high_id UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ,
  CONSTRAINT conversations_distinct_users CHECK (user_low_id < user_high_id),
  CONSTRAINT conversations_pair_key UNIQUE (user_low_id, user_high_id)
);

CREATE TRIGGER conversations_set_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE INDEX conversations_last_message_at_idx
  ON conversations (last_message_at DESC NULLS LAST);

-- ===========================================================================
-- CONVERSATION MEMBERS
-- joined_at is the membership created timestamp (Express default-inserts it).
-- last_read_at is the unread watermark used by the current backend.
-- ===========================================================================

CREATE TABLE conversation_members (
  conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  last_read_at TIMESTAMPTZ,
  CONSTRAINT conversation_members_pkey PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX conversation_members_user_id_idx
  ON conversation_members (user_id);

CREATE OR REPLACE FUNCTION conversation_member_must_match_pair()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  pair conversations%ROWTYPE;
BEGIN
  SELECT * INTO pair FROM conversations WHERE id = NEW.conversation_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'conversation does not exist';
  END IF;

  IF NEW.user_id IS DISTINCT FROM pair.user_low_id
     AND NEW.user_id IS DISTINCT FROM pair.user_high_id THEN
    RAISE EXCEPTION 'user is not part of this conversation pair';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER conversation_members_match_pair
  BEFORE INSERT OR UPDATE OF conversation_id, user_id ON conversation_members
  FOR EACH ROW
  EXECUTE FUNCTION conversation_member_must_match_pair();

-- Deferred so both members can be inserted in one transaction (Express does this).
CREATE OR REPLACE FUNCTION enforce_conversation_exactly_two_members()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
  member_count INTEGER;
  pair conversations%ROWTYPE;
BEGIN
  conv_id := COALESCE(NEW.conversation_id, OLD.conversation_id);

  SELECT * INTO pair FROM conversations WHERE id = conv_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COUNT(*) INTO member_count
  FROM conversation_members
  WHERE conversation_id = conv_id;

  IF member_count <> 2 THEN
    RAISE EXCEPTION 'conversation must have exactly two members';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_id = conv_id AND user_id = pair.user_low_id
  ) OR NOT EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_id = conv_id AND user_id = pair.user_high_id
  ) THEN
    RAISE EXCEPTION 'conversation members must match the canonical user pair';
  END IF;

  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER conversation_members_exactly_two
  AFTER INSERT OR UPDATE OR DELETE ON conversation_members
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION enforce_conversation_exactly_two_members();

-- ===========================================================================
-- MESSAGES
-- Text only. sender must be a member of the conversation.
-- ===========================================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT messages_content_not_blank CHECK (char_length(btrim(content)) > 0),
  CONSTRAINT messages_content_max_length CHECK (char_length(content) <= 4000),
  CONSTRAINT messages_sender_is_member_fkey
    FOREIGN KEY (conversation_id, sender_id)
    REFERENCES conversation_members (conversation_id, user_id)
);

CREATE TRIGGER messages_set_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE INDEX messages_conversation_timeline_idx
  ON messages (conversation_id, created_at DESC, id DESC);

CREATE INDEX messages_conversation_live_idx
  ON messages (conversation_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- ===========================================================================
-- MESSAGE READS
-- Per-message receipts (Express upserts the latest message on mark-read).
-- Conversation-level unread uses conversation_members.last_read_at.
-- ===========================================================================

CREATE TABLE message_reads (
  message_id UUID NOT NULL REFERENCES messages (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT message_reads_pkey PRIMARY KEY (message_id, user_id)
);

CREATE INDEX message_reads_user_id_idx ON message_reads (user_id);

CREATE OR REPLACE FUNCTION message_read_must_be_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM messages m
    INNER JOIN conversation_members cm
      ON cm.conversation_id = m.conversation_id
     AND cm.user_id = NEW.user_id
    WHERE m.id = NEW.message_id
  ) THEN
    RAISE EXCEPTION 'only conversation members can mark a message as read';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER message_reads_must_be_member
  BEFORE INSERT OR UPDATE OF message_id, user_id ON message_reads
  FOR EACH ROW
  EXECUTE FUNCTION message_read_must_be_member();

-- ===========================================================================
-- SECURITY
-- Not Supabase Auth RLS. Default-deny PostgREST (anon / authenticated).
-- Express uses DATABASE_URL as a privileged role that bypasses RLS.
-- ===========================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE users FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE conversations FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE conversation_members FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE messages FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE message_reads FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION set_user_defaults() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION conversation_member_must_match_pair() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION enforce_conversation_exactly_two_members() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION message_read_must_be_member() FROM PUBLIC, anon, authenticated;
