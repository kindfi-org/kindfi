-- Migration: Fix profile creation triggers conflict
-- Problem: Two triggers fire on auth.users INSERT causing conflicts
-- Solution: Consolidate into a single trigger that handles both cases

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

-- Create a unified function that handles both profile and next_auth.users creation
CREATE OR REPLACE FUNCTION public.create_profile_and_sync_next_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the trigger execution for debugging
  RAISE LOG 'create_profile_and_sync_next_auth trigger fired for user_id: %', NEW.id;
  
  -- First, create/update next_auth.users
  INSERT INTO next_auth.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, next_auth.users.name);
  
  RAISE LOG 'next_auth.users created/updated for user_id: %', NEW.id;
  
  -- Then, create/update profile with all required fields
  INSERT INTO public.profiles (
    id, 
    next_auth_user_id, 
    email, 
    display_name,
    role
  )
  VALUES (
    NEW.id, 
    NEW.id,
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous'),
    'kindler' -- Default role
  )
  ON CONFLICT (id) DO UPDATE SET
    next_auth_user_id = COALESCE(EXCLUDED.next_auth_user_id, public.profiles.next_auth_user_id),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    updated_at = now();
  
  RAISE LOG 'Profile created/updated for user_id: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log any errors that occur
    RAISE LOG 'Error in create_profile_and_sync_next_auth: % %', SQLERRM, SQLSTATE;
    -- Re-raise the exception to prevent the user creation if profile creation fails
    RAISE;
END;
$$;

-- Drop the old conflicting triggers
DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
DROP TRIGGER IF EXISTS "after_auth_user_created" ON "auth"."users";

-- Create a single unified trigger
CREATE TRIGGER "on_auth_user_created"
  AFTER INSERT ON "auth"."users"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."create_profile_and_sync_next_auth"();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_profile_and_sync_next_auth() TO service_role, postgres, authenticated;

-- Ensure next_auth schema exists
CREATE SCHEMA IF NOT EXISTS next_auth;

RESET ALL;
