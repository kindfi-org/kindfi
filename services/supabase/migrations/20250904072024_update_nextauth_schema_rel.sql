-- Migration: Fix and complete next_auth schema for NextAuth adapter compatibility
-- Adds missing columns & constraints required by official NextAuth schema
-- Keeps existing data (id values) and trigger-based sync in place.
-- Safe to run multiple times (guards & conditional DDL used).

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'next_auth, public, auth, extensions', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = on;

-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS next_auth;

-- USERS TABLE -----------------------------------------------------------------
-- Add missing columns needed by NextAuth (email, name, image, email_verified)
ALTER TABLE next_auth.users
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS image text,
  ADD COLUMN IF NOT EXISTS email_verified timestamptz;

-- Ensure primary key on id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'next_auth.users'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE next_auth.users ADD PRIMARY KEY (id);
  END IF;
END;$$;

-- Recreate unique constraint on email if it was created referencing a non-existent column previously
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'next_auth.users'::regclass
      AND conname = 'email_unique'
  ) THEN
    -- Drop & recreate to be sure it's valid
    ALTER TABLE next_auth.users DROP CONSTRAINT email_unique;
  END IF;
  -- Only create if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'next_auth' AND table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE next_auth.users ADD CONSTRAINT email_unique UNIQUE (email);
  END IF;
END;$$;

-- SESSIONS TABLE ---------------------------------------------------------------
ALTER TABLE next_auth.sessions
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS session_token text,
  ADD COLUMN IF NOT EXISTS expires timestamptz;

-- Add constraints / indexes for sessions
DO $$
BEGIN
  -- Foreign key
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'next_auth.sessions'::regclass AND contype = 'f' AND conname = 'sessions_user_id_fkey'
  ) THEN
    ALTER TABLE next_auth.sessions
      ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;
  END IF;
  -- Unique session_token
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'next_auth.sessions'::regclass AND contype = 'u' AND conname = 'sessions_session_token_key'
  ) THEN
    ALTER TABLE next_auth.sessions
      ADD CONSTRAINT sessions_session_token_key UNIQUE (session_token);
  END IF;
END;$$;

-- ACCOUNTS TABLE --------------------------------------------------------------
ALTER TABLE next_auth.accounts
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS provider_account_id text,
  ADD COLUMN IF NOT EXISTS refresh_token text,
  ADD COLUMN IF NOT EXISTS access_token text,
  ADD COLUMN IF NOT EXISTS expires_at bigint,
  ADD COLUMN IF NOT EXISTS token_type text,
  ADD COLUMN IF NOT EXISTS scope text,
  ADD COLUMN IF NOT EXISTS id_token text,
  ADD COLUMN IF NOT EXISTS session_state text;

DO $$
BEGIN
  -- FK
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'next_auth.accounts'::regclass AND contype = 'f' AND conname = 'accounts_user_id_fkey'
  ) THEN
    ALTER TABLE next_auth.accounts
      ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;
  END IF;
  -- Unique provider composite
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'next_auth.accounts'::regclass AND contype = 'u' AND conname = 'accounts_provider_provider_account_id_key'
  ) THEN
    ALTER TABLE next_auth.accounts
      ADD CONSTRAINT accounts_provider_provider_account_id_key UNIQUE (provider, provider_account_id);
  END IF;
END;$$;

-- VERIFICATION TOKENS TABLE ---------------------------------------------------
ALTER TABLE next_auth.verification_tokens
  ADD COLUMN IF NOT EXISTS token text,
  ADD COLUMN IF NOT EXISTS expires timestamptz;

DO $$
BEGIN
  -- Drop old constraint if name mismatched
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'next_auth.verification_tokens'::regclass
      AND conname = 'token_identifier_unique'
  ) THEN
    ALTER TABLE next_auth.verification_tokens DROP CONSTRAINT token_identifier_unique;
  END IF;
  -- Add composite uniqueness per NextAuth expectations
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'next_auth.verification_tokens'::regclass
      AND conname = 'verification_tokens_identifier_token_key'
  ) THEN
    ALTER TABLE next_auth.verification_tokens
      ADD CONSTRAINT verification_tokens_identifier_token_key UNIQUE (identifier, token);
  END IF;
END;$$;

-- SECURITY HELPER FUNCTION ----------------------------------------------------
-- Provide a uid() helper delegating to auth.uid() for RLS policies
CREATE OR REPLACE FUNCTION next_auth.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  select auth.uid();
$$;

GRANT EXECUTE ON FUNCTION next_auth.uid() TO authenticated, service_role, postgres;

-- RLS (ensure enabled)
ALTER TABLE next_auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.verification_tokens ENABLE ROW LEVEL SECURITY;

-- (Re)create simple select policies if not exist (id scoped)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='next_auth' AND tablename='users' AND policyname='Users can view own user data' ) THEN
    CREATE POLICY "Users can view own user data" ON next_auth.users
      FOR SELECT USING (next_auth.uid() = id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='next_auth' AND tablename='sessions' AND policyname='Users can view own sessions' ) THEN
    CREATE POLICY "Users can view own sessions" ON next_auth.sessions
      FOR SELECT USING (next_auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='next_auth' AND tablename='accounts' AND policyname='Users can view own accounts' ) THEN
    CREATE POLICY "Users can view own accounts" ON next_auth.accounts
      FOR SELECT USING (next_auth.uid() = user_id);
  END IF;
END;$$;


alter table "public"."devices" drop constraint "devices_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey1" FOREIGN KEY (id) REFERENCES next_auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey1";

alter table "public"."devices" add constraint "devices_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."devices" validate constraint "devices_user_id_fkey";


RESET ALL;