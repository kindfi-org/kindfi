-- Migration: Sync auth.users to next_auth.users after OTP verification
-- Ensures a next_auth.users row (and profile via existing trigger) exists
-- immediately after Supabase auth email signup.

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

CREATE SCHEMA IF NOT EXISTS next_auth;

CREATE OR REPLACE FUNCTION next_auth.sync_auth_user_to_next_auth()
RETURNS trigger AS $$
BEGIN
  -- Insert into next_auth.users
  INSERT INTO next_auth.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, next_auth.users.name);
  
  -- Ensure public.profiles exists (create if not exists)
  INSERT INTO public.profiles (id, next_auth_user_id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.id,
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous')
  )
  ON CONFLICT (id) DO UPDATE SET
    next_auth_user_id = EXCLUDED.next_auth_user_id,
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS after_auth_user_created ON auth.users;
CREATE TRIGGER after_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE next_auth.sync_auth_user_to_next_auth();

GRANT EXECUTE ON FUNCTION next_auth.sync_auth_user_to_next_auth() TO service_role, postgres;

RESET ALL;
