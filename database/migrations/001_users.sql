CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
  CONSTRAINT users_username_length CHECK (char_length(btrim(username)) BETWEEN 4 AND 30),
  CONSTRAINT users_display_name_length CHECK (char_length(btrim(display_name)) BETWEEN 1 AND 70),
  CONSTRAINT users_bio_length CHECK (bio IS NULL OR char_length(bio) <= 140)
);

CREATE OR REPLACE FUNCTION set_user_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
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
  EXECUTE PROCEDURE set_user_defaults();
