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

-- Create extensions (let pgsodium use its default schema)
CREATE EXTENSION IF NOT EXISTS "pgsodium";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- Create enum types for passkey authentication
DO $$ BEGIN
    CREATE TYPE "public"."credential_type" AS ENUM (
        'public-key'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TYPE "public"."credential_type" OWNER TO "postgres";

DO $$ BEGIN
    CREATE TYPE "public"."device_type" AS ENUM (
        'single_device',
        'multi_device'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TYPE "public"."device_type" OWNER TO "postgres";

DO $$ BEGIN
    CREATE TYPE "public"."backup_state" AS ENUM (
        'not_backed_up',
        'backed_up'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TYPE "public"."backup_state" OWNER TO "postgres";

DO $$ BEGIN
    CREATE TYPE "public"."profile_verification_status" AS ENUM (
        'unverified',
        'verified'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TYPE "public"."profile_verification_status" OWNER TO "postgres";

SET default_tablespace = '';
SET default_table_access_method = "heap";

-- Create challenges table for storing temporary WebAuthn challenges
CREATE TABLE IF NOT EXISTS "public"."challenges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "identifier" "text" NOT NULL, -- Email or username used for identification
    "rp_id" "text" NOT NULL, -- Relying Party ID
    "challenge" "text" NOT NULL, -- Base64url encoded challenge
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT (now() + interval '5 minutes') NOT NULL
);

ALTER TABLE "public"."challenges" OWNER TO "postgres";

-- Create devices table for storing WebAuthn credentials
CREATE TABLE IF NOT EXISTS "public"."devices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid", -- References auth.users.id - nullable for anonymous users
    "identifier" "text" NOT NULL, -- Email or username used for identification
    "rp_id" "text" NOT NULL, -- Relying Party ID
    "device_name" "text", -- User-friendly device name
    "credential_type" "public"."credential_type" NOT NULL DEFAULT 'public-key',
    "credential_id" "text" NOT NULL, -- Base64url encoded credential ID
    "aaguid" "text" DEFAULT '00000000-0000-0000-0000-000000000000' NOT NULL,
    "sign_count" integer NOT NULL DEFAULT 0,
    "transports" "text"[] NOT NULL DEFAULT '{}',
    "profile_verification_status" "public"."profile_verification_status" NOT NULL DEFAULT 'unverified',
    "device_type" "public"."device_type" NOT NULL DEFAULT 'single_device',
    "backup_state" "public"."backup_state" NOT NULL DEFAULT 'not_backed_up',
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_used_at" timestamp with time zone,
    "public_key" "text" NOT NULL
);

ALTER TABLE "public"."devices" OWNER TO "postgres";

-- Alter profiles table to add email field with proper relationship to auth.users
-- Add email column as nullable initially
ALTER TABLE "public"."profiles"
    ADD COLUMN IF NOT EXISTS "email" "text",
    OWNER TO "postgres";

-- Primary key constraints
ALTER TABLE ONLY "public"."challenges"
    ADD CONSTRAINT "challenges_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."devices"
    ADD CONSTRAINT "devices_pkey" PRIMARY KEY ("id");

-- Unique constraints
ALTER TABLE ONLY "public"."challenges"
    ADD CONSTRAINT "challenges_identifier_rp_id_key" UNIQUE ("identifier", "rp_id");

ALTER TABLE ONLY "public"."devices"
    ADD CONSTRAINT "devices_credential_id_key" UNIQUE ("credential_id");

-- Foreign key constraints
ALTER TABLE ONLY "public"."challenges"
    ADD CONSTRAINT "challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."devices"
    ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_challenges_identifier_rp_id" ON "public"."challenges"("identifier", "rp_id");
CREATE INDEX IF NOT EXISTS "idx_challenges_expires_at" ON "public"."challenges"("expires_at");
CREATE INDEX IF NOT EXISTS "idx_devices_user_id" ON "public"."devices"("user_id");
CREATE INDEX IF NOT EXISTS "idx_devices_identifier_rp_id" ON "public"."devices"("identifier", "rp_id");
CREATE INDEX IF NOT EXISTS "idx_devices_credential_id" ON "public"."devices"("credential_id");

-- Enable Row Level Security
ALTER TABLE "public"."challenges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."devices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges table
CREATE POLICY "Users can manage their own challenges"
    ON "public"."challenges"
    FOR ALL
    USING ("user_id" = "auth"."uid"());

CREATE POLICY "Service role can manage all challenges"
    ON "public"."challenges"
    FOR ALL
    TO "service_role"
    USING (true);

-- RLS Policies for devices table
CREATE POLICY "Users can view their own devices"
    ON "public"."devices"
    FOR SELECT
    USING ("user_id" = "auth"."uid"());

CREATE POLICY "Users can insert their own devices"
    ON "public"."devices"
    FOR INSERT
    WITH CHECK ("user_id" = "auth"."uid"());

CREATE POLICY "Users can update their own devices"
    ON "public"."devices"
    FOR UPDATE
    USING ("user_id" = "auth"."uid"());

CREATE POLICY "Users can delete their own devices"
    ON "public"."devices"
    FOR DELETE
    USING ("user_id" = "auth"."uid"());

CREATE POLICY "Service role can manage all devices"
    ON "public"."devices"
    FOR ALL
    TO "service_role"
    USING (true);

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile"
    ON "public"."profiles"
    FOR SELECT
    USING ("id" = "auth"."uid"());

CREATE POLICY "Service role can manage all profiles"
    ON "public"."profiles"
    FOR ALL
    TO "service_role"
    USING (true);

-- Grant necessary permissions
GRANT ALL ON TABLE "public"."challenges" TO "anon";
GRANT ALL ON TABLE "public"."challenges" TO "authenticated";
GRANT ALL ON TABLE "public"."challenges" TO "service_role";

GRANT ALL ON TABLE "public"."devices" TO "anon";
GRANT ALL ON TABLE "public"."devices" TO "authenticated";
GRANT ALL ON TABLE "public"."devices" TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

-- Function to create profile for new user with conflict resolution
CREATE OR REPLACE FUNCTION "public"."create_profile_for_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (
      NEW.id,
      NEW.email
    );
    RETURN NEW;
  END;
  $$;

ALTER FUNCTION "public"."create_profile_for_new_user"() OWNER TO "postgres";

-- Function to clean up expired challenges
CREATE OR REPLACE FUNCTION "public"."cleanup_expired_challenges"()
RETURNS void AS $$
BEGIN
    DELETE FROM "public"."challenges" 
    WHERE "expires_at" < now();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION "public"."update_devices_updated_at"()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "devices_updated_at_trigger"
    BEFORE UPDATE ON "public"."devices"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."update_devices_updated_at"();

-- Grant function privileges to all roles in public schema
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

-- Grant sequence privileges
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

-- Grant table privileges
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
