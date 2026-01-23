# Database Design

This document details the Convayto database schema, design decisions, and security measures.

## Overview

Convayto uses **Supabase** (PostgreSQL) for data storage with a focus on simplicity and security.

**Design Philosophy:**

- Keep it simple - only essential tables
- Use views instead of redundant tables
- Leverage Row-Level Security for access control
- Enable Realtime for instant updates

## Database Schema

```
┌─────────────────────────┐
│   auth.users (Supabase) │
│  (Managed by Supabase)  │
└───────────┬─────────────┘
            │
    ┌───────┴────────┐
    │                │
    ↓                ↓
┌─────────┐      ┌──────────┐
│ Users   │      │ Usernames│
│ (View)  │      │ (View)   │
└────┬────┘      └──────────┘
     │
  ┌──┴──┐
  │     │
  ↓     ↓
┌──────────────────┐      ┌──────────────────┐
│  Conversations   │      │     Messages     │
│    (Table)       │────→ │     (Table)      │
└──────────────────┘      └──────────────────┘
  (Realtime: ON)           (Realtime: ON)
```

## Tables

### Conversations

Stores 1-on-1 conversation metadata between two users.

**Purpose:**

- Tracks which users are connected
- Stores the last message (preview for sidebar)
- Enables efficient querying of user's conversations

**Columns:**

| Column         | Type          | Constraints                      | Notes                                   |
| -------------- | ------------- | -------------------------------- | --------------------------------------- |
| `id`           | `UUID`        | PK, Default: `gen_random_uuid()` | Unique identifier                       |
| `created_at`   | `Timestamptz` | Default: `now()`                 | When conversation started               |
| `user1_id`     | `UUID`        | FK → auth.users                  | First participant                       |
| `user2_id`     | `UUID`        | FK → auth.users                  | Second participant                      |
| `last_message` | `JSONB`       | Nullable                         | Denormalized last message (for display) |

**Example:**

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "created_at": "2025-01-23T10:30:00Z",
  "user1_id": "auth_user_1",
  "user2_id": "auth_user_2",
  "last_message": {
    "id": "msg_123",
    "content": "Hey, how are you?",
    "sender_id": "auth_user_1",
    "created_at": "2025-01-23T11:45:00Z"
  }
}
```

**Row-Level Security (RLS):**

```sql
-- Users can only see conversations they're part of
CREATE POLICY "Users can view their conversations"
  ON conversations
  FOR SELECT
  USING (user1_id = auth.uid() OR user2_id = auth.uid())

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated')

-- Users can only update their own conversations
CREATE POLICY "Users can update their conversations"
  ON conversations
  FOR UPDATE
  USING (user1_id = auth.uid() OR user2_id = auth.uid())
```

**Realtime:**

- ✅ Enabled: Changes broadcast to subscribed clients instantly

### Messages

Stores chat messages within conversations.

**Purpose:**

- Persist user messages
- Enable message history retrieval
- Support infinite scroll pagination

**Columns:**

| Column            | Type          | Constraints                            | Notes              |
| ----------------- | ------------- | -------------------------------------- | ------------------ |
| `id`              | `UUID`        | PK, Default: `gen_random_uuid()`       | Unique message ID  |
| `created_at`      | `Timestamptz` | Default: `now()`                       | Message timestamp  |
| `sender_id`       | `UUID`        | FK → auth.users, Default: `auth.uid()` | Who sent it        |
| `conversation_id` | `UUID`        | FK → conversations                     | Which conversation |
| `content`         | `Text`        | Not null                               | Message text       |

**Example:**

```json
{
  "id": "msg_abc123",
  "created_at": "2025-01-23T11:45:00Z",
  "sender_id": "auth_user_1",
  "conversation_id": "conv_xyz789",
  "content": "Hey, how are you?"
}
```

**Row-Level Security (RLS):**

```sql
-- Users can view messages only in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  )

-- Users can only insert messages in their conversations
CREATE POLICY "Users can insert messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM conversations
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  )
```

**Realtime:**

- ✅ Enabled: New messages broadcast instantly to subscribers

**Indexing:**

```sql
-- Efficient message retrieval
CREATE INDEX messages_conversation_id_created_at
  ON messages(conversation_id, created_at DESC)
```

## Views

Views provide read-only access to denormalized data from `auth.users` without duplicating user data.

### Users View

Extracts user profile data from Supabase's `auth.users` table.

**Purpose:**

- Expose user profile info to authenticated users
- Single source of truth (derives from auth.users)
- Automatically stays in sync with auth.users

**Columns:**

| Column       | Source                                       | Notes               |
| ------------ | -------------------------------------------- | ------------------- |
| `id`         | `auth.users.id`                              | User ID             |
| `email`      | `auth.users.email`                           | Email address       |
| `username`   | `auth.users.raw_user_meta_data→'username'`   | Custom username     |
| `fullname`   | `auth.users.raw_user_meta_data→'fullname'`   | Full name           |
| `avatar_url` | `auth.users.raw_user_meta_data→'avatar_url'` | Profile picture URL |
| `bio`        | `auth.users.raw_user_meta_data→'bio'`        | User bio            |

**SQL Definition:**

```sql
CREATE VIEW public.users AS
SELECT
  id,
  email,
  raw_user_meta_data->>'username' AS username,
  raw_user_meta_data->>'fullname' AS fullname,
  raw_user_meta_data->>'avatar_url' AS avatar_url,
  raw_user_meta_data->>'bio' AS bio
FROM auth.users

-- Grant access to authenticated users only
GRANT SELECT ON TABLE public.users TO authenticated
```

**Access Control:**

```sql
CREATE POLICY "Authenticated users can view other users"
  ON users
  FOR SELECT
  USING (auth.role() = 'authenticated')
```

### Usernames View

Provides read-only access to usernames without exposing other user data.

**Purpose:**

- Check username availability during signup (before authentication)
- Anonymous users need to check if username is taken
- Protect other user data from anonymous access

**Columns:**

| Column     | Source                                     | Notes           |
| ---------- | ------------------------------------------ | --------------- |
| `username` | `auth.users.raw_user_meta_data→'username'` | Unique username |

**SQL Definition:**

```sql
CREATE VIEW public.usernames AS
SELECT
  raw_user_meta_data->>'username' AS username
FROM auth.users
WHERE raw_user_meta_data->>'username' IS NOT NULL

-- Grant access to anonymous users (for signup flow)
GRANT SELECT ON TABLE public.usernames TO anon
```

**Why Not a Separate Table?**

A separate `usernames` table would require:

- Triggers to keep it in sync
- Extra maintenance overhead
- Duplicate data

Using a view is simpler and stays automatically in sync with auth.users.

## Storage (File Uploads)

### Avatars Bucket

Stores user profile pictures.

**Bucket Name:** `avatars`

**Configuration:**

- Public: ✅ Yes (users need to see each other's avatars)
- File size limit: 5 MB
- Allowed MIME types:
  - `image/jpeg`
  - `image/png`
  - `image/webp`

**Storage Path:** `avatars/{user_id}/avatar.{ext}`

**RLS Policy:**

```sql
-- Users can upload their own avatars
CREATE POLICY "Users can upload their own avatars"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )

-- Users can update their own avatars
CREATE POLICY "Users can update their own avatars"
  ON storage.objects
  FOR UPDATE
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
```

## How Data Flows

### Signup Flow

```
1. User enters username
   ↓
2. Check `usernames` view (anonymous access allowed)
   ↓
3. If available, user completes signup
   ↓
4. Supabase Auth creates entry in auth.users
   ↓
5. User data flows to `users` and `usernames` views automatically
   ↓
6. User can now see themselves and other users
```

### First Conversation

```
1. User A searches for User B
   ↓
2. Query `users` view (filtered by search)
   ↓
3. User A selects User B
   ↓
4. Insert into `conversations` table
   ↓
5. RLS ensures user A is authorized
   ↓
6. Conversation created and becomes visible to both users
```

### Send Message

```
1. User types message in conversation
   ↓
2. Submit message
   ↓
3. Insert into `messages` table
   ↓
4. RLS checks:
      - User is authenticated
      - User is participant in conversation
      - Message content is not empty
   ↓
5. Message inserted successfully
   ↓
6. Realtime broadcast to conversation subscribers
   ↓
7. Both users see message instantly
   ↓
8. Update `conversations.last_message` (denormalized)
   ↓
9. Both users see updated preview in sidebar
```

## Security Analysis

### Row-Level Security (RLS)

✅ **Pros:**

- Access control enforced at database level
- Cannot bypass with API tricks
- Works with any client

❌ **Limitations:**

- No server-side validation
- Client has access to Supabase credentials

### Supabase Credentials Management

Always protect your Supabase credentials using environment variables:

```javascript
// ✅ CORRECT: Use environment variables
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

Store credentials in `.env`:

```
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Critical Security Rules:**

- ❌ **Never** expose your service/secret role key
- ❌ **Never** commit `.env` to version control
- ❌ **Never** log or display credentials in code
- ✅ Always use environment variables
- ✅ Always enable Row-Level Security (RLS) policies
- ✅ Always validate on the server side

## Backing Up Your Data

To backup Convayto data:

```bash
# Using Supabase CLI
supabase db pull  # Download schema
supabase db push  # Push schema back

# Manual SQL export
# Use Supabase dashboard → SQL Editor → Export as SQL
```

## Monitoring Performance

Check slow queries in Supabase:

- Dashboard → Database → Queries
- Dashboard → Database → Indexes

## Future Improvements

- [ ] Message search functionality (full-text search)
- [ ] Message history pagination (infinite scroll)
- [ ] Conversation soft-delete (archive)
- [ ] User blocking / reporting
- [ ] Message encryption
- [ ] Read receipts

---

For implementation details, see the codebase in `src/features/` and refer to the [Supabase documentation](https://supabase.com/docs).
