SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Create NextAuth schema for Supabase Adapter
CREATE SCHEMA IF NOT EXISTS next_auth;
GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT ALL ON SCHEMA next_auth TO postgres;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Create users table for NextAuth
CREATE TABLE IF NOT EXISTS next_auth.users (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    name text,
    email text,
    "emailVerified" timestamp with time zone,
    image text,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT email_unique UNIQUE (email)
);

GRANT ALL ON TABLE next_auth.users TO postgres;
GRANT ALL ON TABLE next_auth.users TO service_role;

-- uid() function to be used in RLS policies
CREATE OR REPLACE FUNCTION next_auth.uid() RETURNS UUID
    LANGUAGE sql STABLE
    AS $$
  select
  	coalesce(
		nullif(current_setting('request.jwt.claim.sub', true), ''),
		(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
	)::UUID
$$;

-- Create sessions table for NextAuth
CREATE TABLE IF NOT EXISTS next_auth.sessions (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    expires timestamp with time zone NOT NULL,
    session_token text NOT NULL,
    user_id UUID,
    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT sessionToken_unique UNIQUE (session_token),
    CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES next_auth.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.sessions TO postgres;
GRANT ALL ON TABLE next_auth.sessions TO service_role;

-- Create accounts table for NextAuth
CREATE TABLE IF NOT EXISTS next_auth.accounts (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    type text NOT NULL,
    provider text NOT NULL,
    provider_account_id text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at bigint,
    token_type text,
    scope text,
    id_token text,
    session_state text,
    oauth_token_secret text,
    oauth_token text,
    user_id UUID,
    CONSTRAINT accounts_pkey PRIMARY KEY (id),
    CONSTRAINT provider_unique UNIQUE (provider, provider_account_id),
    CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES next_auth.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.accounts TO postgres;
GRANT ALL ON TABLE next_auth.accounts TO service_role;

-- Create verification_tokens table for NextAuth
CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
    identifier text,
    token text,
    expires timestamp with time zone NOT NULL,
    CONSTRAINT verification_tokens_pkey PRIMARY KEY (token),
    CONSTRAINT token_unique UNIQUE (token),
    CONSTRAINT token_identifier_unique UNIQUE (token, identifier)
);

GRANT ALL ON TABLE next_auth.verification_tokens TO postgres;
GRANT ALL ON TABLE next_auth.verification_tokens TO service_role;

-- Enable Row Level Security on NextAuth tables
ALTER TABLE next_auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for NextAuth tables
CREATE POLICY "Users can view own user data" ON next_auth.users
    FOR SELECT USING (next_auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON next_auth.sessions
    FOR SELECT USING (next_auth.uid() = user_id);

CREATE POLICY "Users can view own accounts" ON next_auth.accounts
    FOR SELECT USING (next_auth.uid() = user_id);

-- Service role can manage all NextAuth data
CREATE POLICY "Service role can manage all users" ON next_auth.users
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all sessions" ON next_auth.sessions
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all accounts" ON next_auth.accounts
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all verification tokens" ON next_auth.verification_tokens
    FOR ALL TO service_role USING (true);

-- Update the profiles table to reference next_auth.users instead of auth.users
-- Add next_auth_user_id column to profiles
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS next_auth_user_id UUID,
    ADD CONSTRAINT profiles_next_auth_user_id_fkey 
        FOREIGN KEY (next_auth_user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

-- Update devices table to reference next_auth.users
ALTER TABLE public.devices 
    ADD COLUMN IF NOT EXISTS next_auth_user_id UUID,
    ADD CONSTRAINT devices_next_auth_user_id_fkey 
        FOREIGN KEY (next_auth_user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

-- Update challenges table to reference next_auth.users
ALTER TABLE public.challenges 
    ADD COLUMN IF NOT EXISTS next_auth_user_id UUID,
    ADD CONSTRAINT challenges_next_auth_user_id_fkey 
        FOREIGN KEY (next_auth_user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to use next_auth.uid() function
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own devices" ON public.devices;
DROP POLICY IF EXISTS "Users can insert their own devices" ON public.devices;
DROP POLICY IF EXISTS "Users can update their own devices" ON public.devices;
DROP POLICY IF EXISTS "Users can delete their own devices" ON public.devices;
DROP POLICY IF EXISTS "Users can manage their own challenges" ON public.challenges;

-- Create new RLS policies using NextAuth schema
CREATE POLICY "Users can view their own profile via NextAuth" ON public.profiles
    FOR SELECT USING (next_auth_user_id = next_auth.uid());

CREATE POLICY "Users can update their own profile via NextAuth" ON public.profiles
    FOR UPDATE USING (next_auth_user_id = next_auth.uid());

CREATE POLICY "Users can view their own devices via NextAuth" ON public.devices
    FOR SELECT USING (next_auth_user_id = next_auth.uid());

CREATE POLICY "Users can insert their own devices via NextAuth" ON public.devices
    FOR INSERT WITH CHECK (next_auth_user_id = next_auth.uid());

CREATE POLICY "Users can update their own devices via NextAuth" ON public.devices
    FOR UPDATE USING (next_auth_user_id = next_auth.uid());

CREATE POLICY "Users can delete their own devices via NextAuth" ON public.devices
    FOR DELETE USING (next_auth_user_id = next_auth.uid());

CREATE POLICY "Users can manage their own challenges via NextAuth" ON public.challenges
    FOR ALL USING (next_auth_user_id = next_auth.uid());

-- Function to create profile for new NextAuth user
CREATE OR REPLACE FUNCTION public.handle_new_next_auth_user()
RETURNS trigger AS $$
BEGIN
    -- Ensure all required columns in public.profiles are handled
    INSERT INTO public.profiles (id, next_auth_user_id, email, display_name)
    VALUES (NEW.id, NEW.id, NEW.email, COALESCE(NEW.name, 'Anonymous'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when NextAuth user is created
CREATE TRIGGER on_next_auth_user_created
    AFTER INSERT ON next_auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_next_auth_user();

-- Grant necessary permissions for NextAuth schema functions
GRANT EXECUTE ON FUNCTION next_auth.uid() TO postgres, service_role, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_next_auth_user() TO postgres, service_role;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_next_auth_sessions_user_id ON next_auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_next_auth_sessions_session_token ON next_auth.sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_next_auth_accounts_user_id ON next_auth.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_next_auth_accounts_provider ON next_auth.accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_profiles_next_auth_user_id ON public.profiles(next_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_devices_next_auth_user_id ON public.devices(next_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_next_auth_user_id ON public.challenges(next_auth_user_id);

RESET ALL;
