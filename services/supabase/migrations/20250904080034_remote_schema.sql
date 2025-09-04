drop extension if exists "pg_net";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION extensions.grant_pg_cron_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION extensions.grant_pg_net_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_event_trigger_ddl_commands() AS ev
      JOIN pg_extension AS ext
      ON ev.objid = ext.oid
      WHERE ext.extname = 'pg_net'
    )
    THEN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'supabase_functions_admin'
      )
      THEN
        CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
      END IF;

      GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

      IF EXISTS (
        SELECT FROM pg_extension
        WHERE extname = 'pg_net'
        -- all versions in use on existing projects as of 2025-02-20
        -- version 0.12.0 onwards don't need these applied
        AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
      ) THEN
        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

        REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
        REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

        GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
        GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      END IF;
    END IF;
  END;
  $function$
;

revoke delete on table "next_auth"."accounts" from "service_role";

revoke insert on table "next_auth"."accounts" from "service_role";

revoke references on table "next_auth"."accounts" from "service_role";

revoke select on table "next_auth"."accounts" from "service_role";

revoke trigger on table "next_auth"."accounts" from "service_role";

revoke truncate on table "next_auth"."accounts" from "service_role";

revoke update on table "next_auth"."accounts" from "service_role";

revoke delete on table "next_auth"."sessions" from "service_role";

revoke insert on table "next_auth"."sessions" from "service_role";

revoke references on table "next_auth"."sessions" from "service_role";

revoke select on table "next_auth"."sessions" from "service_role";

revoke trigger on table "next_auth"."sessions" from "service_role";

revoke truncate on table "next_auth"."sessions" from "service_role";

revoke update on table "next_auth"."sessions" from "service_role";

revoke delete on table "next_auth"."users" from "service_role";

revoke insert on table "next_auth"."users" from "service_role";

revoke references on table "next_auth"."users" from "service_role";

revoke select on table "next_auth"."users" from "service_role";

revoke trigger on table "next_auth"."users" from "service_role";

revoke truncate on table "next_auth"."users" from "service_role";

revoke update on table "next_auth"."users" from "service_role";

revoke delete on table "next_auth"."verification_tokens" from "service_role";

revoke insert on table "next_auth"."verification_tokens" from "service_role";

revoke references on table "next_auth"."verification_tokens" from "service_role";

revoke select on table "next_auth"."verification_tokens" from "service_role";

revoke trigger on table "next_auth"."verification_tokens" from "service_role";

revoke truncate on table "next_auth"."verification_tokens" from "service_role";

revoke update on table "next_auth"."verification_tokens" from "service_role";

alter table "next_auth"."accounts" alter column "id" set default extensions.uuid_generate_v4();

alter table "next_auth"."sessions" alter column "id" set default extensions.uuid_generate_v4();

alter table "next_auth"."users" alter column "id" set default extensions.uuid_generate_v4();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION next_auth.sync_auth_user_to_next_auth()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION next_auth.uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select auth.uid();
$function$
;

revoke select on table "public"."categories" from "public";

revoke delete on table "public"."categories" from "anon";

revoke insert on table "public"."categories" from "anon";

revoke references on table "public"."categories" from "anon";

revoke select on table "public"."categories" from "anon";

revoke trigger on table "public"."categories" from "anon";

revoke truncate on table "public"."categories" from "anon";

revoke update on table "public"."categories" from "anon";

revoke delete on table "public"."categories" from "authenticated";

revoke insert on table "public"."categories" from "authenticated";

revoke references on table "public"."categories" from "authenticated";

revoke select on table "public"."categories" from "authenticated";

revoke trigger on table "public"."categories" from "authenticated";

revoke truncate on table "public"."categories" from "authenticated";

revoke update on table "public"."categories" from "authenticated";

revoke delete on table "public"."categories" from "service_role";

revoke insert on table "public"."categories" from "service_role";

revoke references on table "public"."categories" from "service_role";

revoke select on table "public"."categories" from "service_role";

revoke trigger on table "public"."categories" from "service_role";

revoke truncate on table "public"."categories" from "service_role";

revoke update on table "public"."categories" from "service_role";

revoke delete on table "public"."challenges" from "anon";

revoke insert on table "public"."challenges" from "anon";

revoke references on table "public"."challenges" from "anon";

revoke select on table "public"."challenges" from "anon";

revoke trigger on table "public"."challenges" from "anon";

revoke truncate on table "public"."challenges" from "anon";

revoke update on table "public"."challenges" from "anon";

revoke delete on table "public"."challenges" from "authenticated";

revoke insert on table "public"."challenges" from "authenticated";

revoke references on table "public"."challenges" from "authenticated";

revoke select on table "public"."challenges" from "authenticated";

revoke trigger on table "public"."challenges" from "authenticated";

revoke truncate on table "public"."challenges" from "authenticated";

revoke update on table "public"."challenges" from "authenticated";

revoke delete on table "public"."challenges" from "service_role";

revoke insert on table "public"."challenges" from "service_role";

revoke references on table "public"."challenges" from "service_role";

revoke select on table "public"."challenges" from "service_role";

revoke trigger on table "public"."challenges" from "service_role";

revoke truncate on table "public"."challenges" from "service_role";

revoke update on table "public"."challenges" from "service_role";

revoke delete on table "public"."comments" from "anon";

revoke insert on table "public"."comments" from "anon";

revoke references on table "public"."comments" from "anon";

revoke select on table "public"."comments" from "anon";

revoke trigger on table "public"."comments" from "anon";

revoke truncate on table "public"."comments" from "anon";

revoke update on table "public"."comments" from "anon";

revoke delete on table "public"."comments" from "authenticated";

revoke insert on table "public"."comments" from "authenticated";

revoke references on table "public"."comments" from "authenticated";

revoke select on table "public"."comments" from "authenticated";

revoke trigger on table "public"."comments" from "authenticated";

revoke truncate on table "public"."comments" from "authenticated";

revoke update on table "public"."comments" from "authenticated";

revoke delete on table "public"."comments" from "service_role";

revoke insert on table "public"."comments" from "service_role";

revoke references on table "public"."comments" from "service_role";

revoke select on table "public"."comments" from "service_role";

revoke trigger on table "public"."comments" from "service_role";

revoke truncate on table "public"."comments" from "service_role";

revoke update on table "public"."comments" from "service_role";

revoke delete on table "public"."community" from "anon";

revoke insert on table "public"."community" from "anon";

revoke references on table "public"."community" from "anon";

revoke select on table "public"."community" from "anon";

revoke trigger on table "public"."community" from "anon";

revoke truncate on table "public"."community" from "anon";

revoke update on table "public"."community" from "anon";

revoke delete on table "public"."community" from "authenticated";

revoke insert on table "public"."community" from "authenticated";

revoke references on table "public"."community" from "authenticated";

revoke select on table "public"."community" from "authenticated";

revoke trigger on table "public"."community" from "authenticated";

revoke truncate on table "public"."community" from "authenticated";

revoke update on table "public"."community" from "authenticated";

revoke delete on table "public"."community" from "service_role";

revoke insert on table "public"."community" from "service_role";

revoke references on table "public"."community" from "service_role";

revoke select on table "public"."community" from "service_role";

revoke trigger on table "public"."community" from "service_role";

revoke truncate on table "public"."community" from "service_role";

revoke update on table "public"."community" from "service_role";

revoke delete on table "public"."contributions" from "anon";

revoke insert on table "public"."contributions" from "anon";

revoke references on table "public"."contributions" from "anon";

revoke select on table "public"."contributions" from "anon";

revoke trigger on table "public"."contributions" from "anon";

revoke truncate on table "public"."contributions" from "anon";

revoke update on table "public"."contributions" from "anon";

revoke delete on table "public"."contributions" from "authenticated";

revoke insert on table "public"."contributions" from "authenticated";

revoke references on table "public"."contributions" from "authenticated";

revoke select on table "public"."contributions" from "authenticated";

revoke trigger on table "public"."contributions" from "authenticated";

revoke truncate on table "public"."contributions" from "authenticated";

revoke update on table "public"."contributions" from "authenticated";

revoke delete on table "public"."contributions" from "service_role";

revoke insert on table "public"."contributions" from "service_role";

revoke references on table "public"."contributions" from "service_role";

revoke select on table "public"."contributions" from "service_role";

revoke trigger on table "public"."contributions" from "service_role";

revoke truncate on table "public"."contributions" from "service_role";

revoke update on table "public"."contributions" from "service_role";

revoke delete on table "public"."devices" from "anon";

revoke insert on table "public"."devices" from "anon";

revoke references on table "public"."devices" from "anon";

revoke select on table "public"."devices" from "anon";

revoke trigger on table "public"."devices" from "anon";

revoke truncate on table "public"."devices" from "anon";

revoke update on table "public"."devices" from "anon";

revoke delete on table "public"."devices" from "authenticated";

revoke insert on table "public"."devices" from "authenticated";

revoke references on table "public"."devices" from "authenticated";

revoke select on table "public"."devices" from "authenticated";

revoke trigger on table "public"."devices" from "authenticated";

revoke truncate on table "public"."devices" from "authenticated";

revoke update on table "public"."devices" from "authenticated";

revoke delete on table "public"."devices" from "service_role";

revoke insert on table "public"."devices" from "service_role";

revoke references on table "public"."devices" from "service_role";

revoke select on table "public"."devices" from "service_role";

revoke trigger on table "public"."devices" from "service_role";

revoke truncate on table "public"."devices" from "service_role";

revoke update on table "public"."devices" from "service_role";

revoke delete on table "public"."escrow_contracts" from "anon";

revoke insert on table "public"."escrow_contracts" from "anon";

revoke references on table "public"."escrow_contracts" from "anon";

revoke select on table "public"."escrow_contracts" from "anon";

revoke trigger on table "public"."escrow_contracts" from "anon";

revoke truncate on table "public"."escrow_contracts" from "anon";

revoke update on table "public"."escrow_contracts" from "anon";

revoke delete on table "public"."escrow_contracts" from "authenticated";

revoke insert on table "public"."escrow_contracts" from "authenticated";

revoke references on table "public"."escrow_contracts" from "authenticated";

revoke select on table "public"."escrow_contracts" from "authenticated";

revoke trigger on table "public"."escrow_contracts" from "authenticated";

revoke truncate on table "public"."escrow_contracts" from "authenticated";

revoke update on table "public"."escrow_contracts" from "authenticated";

revoke delete on table "public"."escrow_contracts" from "service_role";

revoke insert on table "public"."escrow_contracts" from "service_role";

revoke references on table "public"."escrow_contracts" from "service_role";

revoke select on table "public"."escrow_contracts" from "service_role";

revoke trigger on table "public"."escrow_contracts" from "service_role";

revoke truncate on table "public"."escrow_contracts" from "service_role";

revoke update on table "public"."escrow_contracts" from "service_role";

revoke delete on table "public"."escrow_milestones" from "anon";

revoke insert on table "public"."escrow_milestones" from "anon";

revoke references on table "public"."escrow_milestones" from "anon";

revoke select on table "public"."escrow_milestones" from "anon";

revoke trigger on table "public"."escrow_milestones" from "anon";

revoke truncate on table "public"."escrow_milestones" from "anon";

revoke update on table "public"."escrow_milestones" from "anon";

revoke delete on table "public"."escrow_milestones" from "authenticated";

revoke insert on table "public"."escrow_milestones" from "authenticated";

revoke references on table "public"."escrow_milestones" from "authenticated";

revoke select on table "public"."escrow_milestones" from "authenticated";

revoke trigger on table "public"."escrow_milestones" from "authenticated";

revoke truncate on table "public"."escrow_milestones" from "authenticated";

revoke update on table "public"."escrow_milestones" from "authenticated";

revoke delete on table "public"."escrow_milestones" from "service_role";

revoke insert on table "public"."escrow_milestones" from "service_role";

revoke references on table "public"."escrow_milestones" from "service_role";

revoke select on table "public"."escrow_milestones" from "service_role";

revoke trigger on table "public"."escrow_milestones" from "service_role";

revoke truncate on table "public"."escrow_milestones" from "service_role";

revoke update on table "public"."escrow_milestones" from "service_role";

revoke delete on table "public"."escrow_reviews" from "anon";

revoke insert on table "public"."escrow_reviews" from "anon";

revoke references on table "public"."escrow_reviews" from "anon";

revoke select on table "public"."escrow_reviews" from "anon";

revoke trigger on table "public"."escrow_reviews" from "anon";

revoke truncate on table "public"."escrow_reviews" from "anon";

revoke update on table "public"."escrow_reviews" from "anon";

revoke delete on table "public"."escrow_reviews" from "authenticated";

revoke insert on table "public"."escrow_reviews" from "authenticated";

revoke references on table "public"."escrow_reviews" from "authenticated";

revoke select on table "public"."escrow_reviews" from "authenticated";

revoke trigger on table "public"."escrow_reviews" from "authenticated";

revoke truncate on table "public"."escrow_reviews" from "authenticated";

revoke update on table "public"."escrow_reviews" from "authenticated";

revoke delete on table "public"."escrow_reviews" from "service_role";

revoke insert on table "public"."escrow_reviews" from "service_role";

revoke references on table "public"."escrow_reviews" from "service_role";

revoke select on table "public"."escrow_reviews" from "service_role";

revoke trigger on table "public"."escrow_reviews" from "service_role";

revoke truncate on table "public"."escrow_reviews" from "service_role";

revoke update on table "public"."escrow_reviews" from "service_role";

revoke delete on table "public"."escrow_status" from "anon";

revoke insert on table "public"."escrow_status" from "anon";

revoke references on table "public"."escrow_status" from "anon";

revoke select on table "public"."escrow_status" from "anon";

revoke trigger on table "public"."escrow_status" from "anon";

revoke truncate on table "public"."escrow_status" from "anon";

revoke update on table "public"."escrow_status" from "anon";

revoke delete on table "public"."escrow_status" from "authenticated";

revoke insert on table "public"."escrow_status" from "authenticated";

revoke references on table "public"."escrow_status" from "authenticated";

revoke select on table "public"."escrow_status" from "authenticated";

revoke trigger on table "public"."escrow_status" from "authenticated";

revoke truncate on table "public"."escrow_status" from "authenticated";

revoke update on table "public"."escrow_status" from "authenticated";

revoke delete on table "public"."escrow_status" from "service_role";

revoke insert on table "public"."escrow_status" from "service_role";

revoke references on table "public"."escrow_status" from "service_role";

revoke select on table "public"."escrow_status" from "service_role";

revoke trigger on table "public"."escrow_status" from "service_role";

revoke truncate on table "public"."escrow_status" from "service_role";

revoke update on table "public"."escrow_status" from "service_role";

revoke delete on table "public"."kindler_projects" from "anon";

revoke insert on table "public"."kindler_projects" from "anon";

revoke references on table "public"."kindler_projects" from "anon";

revoke select on table "public"."kindler_projects" from "anon";

revoke trigger on table "public"."kindler_projects" from "anon";

revoke truncate on table "public"."kindler_projects" from "anon";

revoke update on table "public"."kindler_projects" from "anon";

revoke delete on table "public"."kindler_projects" from "authenticated";

revoke insert on table "public"."kindler_projects" from "authenticated";

revoke references on table "public"."kindler_projects" from "authenticated";

revoke select on table "public"."kindler_projects" from "authenticated";

revoke trigger on table "public"."kindler_projects" from "authenticated";

revoke truncate on table "public"."kindler_projects" from "authenticated";

revoke update on table "public"."kindler_projects" from "authenticated";

revoke delete on table "public"."kindler_projects" from "service_role";

revoke insert on table "public"."kindler_projects" from "service_role";

revoke references on table "public"."kindler_projects" from "service_role";

revoke select on table "public"."kindler_projects" from "service_role";

revoke trigger on table "public"."kindler_projects" from "service_role";

revoke truncate on table "public"."kindler_projects" from "service_role";

revoke update on table "public"."kindler_projects" from "service_role";

revoke delete on table "public"."kyc_admin_whitelist" from "anon";

revoke insert on table "public"."kyc_admin_whitelist" from "anon";

revoke references on table "public"."kyc_admin_whitelist" from "anon";

revoke select on table "public"."kyc_admin_whitelist" from "anon";

revoke trigger on table "public"."kyc_admin_whitelist" from "anon";

revoke truncate on table "public"."kyc_admin_whitelist" from "anon";

revoke update on table "public"."kyc_admin_whitelist" from "anon";

revoke delete on table "public"."kyc_admin_whitelist" from "authenticated";

revoke insert on table "public"."kyc_admin_whitelist" from "authenticated";

revoke references on table "public"."kyc_admin_whitelist" from "authenticated";

revoke select on table "public"."kyc_admin_whitelist" from "authenticated";

revoke trigger on table "public"."kyc_admin_whitelist" from "authenticated";

revoke truncate on table "public"."kyc_admin_whitelist" from "authenticated";

revoke update on table "public"."kyc_admin_whitelist" from "authenticated";

revoke delete on table "public"."kyc_admin_whitelist" from "service_role";

revoke insert on table "public"."kyc_admin_whitelist" from "service_role";

revoke references on table "public"."kyc_admin_whitelist" from "service_role";

revoke select on table "public"."kyc_admin_whitelist" from "service_role";

revoke trigger on table "public"."kyc_admin_whitelist" from "service_role";

revoke truncate on table "public"."kyc_admin_whitelist" from "service_role";

revoke update on table "public"."kyc_admin_whitelist" from "service_role";

revoke delete on table "public"."kyc_reviews" from "anon";

revoke insert on table "public"."kyc_reviews" from "anon";

revoke references on table "public"."kyc_reviews" from "anon";

revoke select on table "public"."kyc_reviews" from "anon";

revoke trigger on table "public"."kyc_reviews" from "anon";

revoke truncate on table "public"."kyc_reviews" from "anon";

revoke update on table "public"."kyc_reviews" from "anon";

revoke delete on table "public"."kyc_reviews" from "authenticated";

revoke insert on table "public"."kyc_reviews" from "authenticated";

revoke references on table "public"."kyc_reviews" from "authenticated";

revoke select on table "public"."kyc_reviews" from "authenticated";

revoke trigger on table "public"."kyc_reviews" from "authenticated";

revoke truncate on table "public"."kyc_reviews" from "authenticated";

revoke update on table "public"."kyc_reviews" from "authenticated";

revoke delete on table "public"."kyc_reviews" from "service_role";

revoke insert on table "public"."kyc_reviews" from "service_role";

revoke references on table "public"."kyc_reviews" from "service_role";

revoke select on table "public"."kyc_reviews" from "service_role";

revoke trigger on table "public"."kyc_reviews" from "service_role";

revoke truncate on table "public"."kyc_reviews" from "service_role";

revoke update on table "public"."kyc_reviews" from "service_role";

revoke delete on table "public"."milestones" from "anon";

revoke insert on table "public"."milestones" from "anon";

revoke references on table "public"."milestones" from "anon";

revoke select on table "public"."milestones" from "anon";

revoke trigger on table "public"."milestones" from "anon";

revoke truncate on table "public"."milestones" from "anon";

revoke update on table "public"."milestones" from "anon";

revoke delete on table "public"."milestones" from "authenticated";

revoke insert on table "public"."milestones" from "authenticated";

revoke references on table "public"."milestones" from "authenticated";

revoke select on table "public"."milestones" from "authenticated";

revoke trigger on table "public"."milestones" from "authenticated";

revoke truncate on table "public"."milestones" from "authenticated";

revoke update on table "public"."milestones" from "authenticated";

revoke delete on table "public"."milestones" from "service_role";

revoke insert on table "public"."milestones" from "service_role";

revoke references on table "public"."milestones" from "service_role";

revoke select on table "public"."milestones" from "service_role";

revoke trigger on table "public"."milestones" from "service_role";

revoke truncate on table "public"."milestones" from "service_role";

revoke update on table "public"."milestones" from "service_role";

revoke delete on table "public"."notification_preferences" from "anon";

revoke insert on table "public"."notification_preferences" from "anon";

revoke references on table "public"."notification_preferences" from "anon";

revoke select on table "public"."notification_preferences" from "anon";

revoke trigger on table "public"."notification_preferences" from "anon";

revoke truncate on table "public"."notification_preferences" from "anon";

revoke update on table "public"."notification_preferences" from "anon";

revoke delete on table "public"."notification_preferences" from "authenticated";

revoke insert on table "public"."notification_preferences" from "authenticated";

revoke references on table "public"."notification_preferences" from "authenticated";

revoke select on table "public"."notification_preferences" from "authenticated";

revoke trigger on table "public"."notification_preferences" from "authenticated";

revoke truncate on table "public"."notification_preferences" from "authenticated";

revoke update on table "public"."notification_preferences" from "authenticated";

revoke delete on table "public"."notification_preferences" from "service_role";

revoke insert on table "public"."notification_preferences" from "service_role";

revoke references on table "public"."notification_preferences" from "service_role";

revoke select on table "public"."notification_preferences" from "service_role";

revoke trigger on table "public"."notification_preferences" from "service_role";

revoke truncate on table "public"."notification_preferences" from "service_role";

revoke update on table "public"."notification_preferences" from "service_role";

revoke delete on table "public"."notifications" from "anon";

revoke insert on table "public"."notifications" from "anon";

revoke references on table "public"."notifications" from "anon";

revoke select on table "public"."notifications" from "anon";

revoke trigger on table "public"."notifications" from "anon";

revoke truncate on table "public"."notifications" from "anon";

revoke update on table "public"."notifications" from "anon";

revoke delete on table "public"."notifications" from "authenticated";

revoke insert on table "public"."notifications" from "authenticated";

revoke references on table "public"."notifications" from "authenticated";

revoke select on table "public"."notifications" from "authenticated";

revoke trigger on table "public"."notifications" from "authenticated";

revoke truncate on table "public"."notifications" from "authenticated";

revoke update on table "public"."notifications" from "authenticated";

revoke delete on table "public"."notifications" from "service_role";

revoke insert on table "public"."notifications" from "service_role";

revoke references on table "public"."notifications" from "service_role";

revoke select on table "public"."notifications" from "service_role";

revoke trigger on table "public"."notifications" from "service_role";

revoke truncate on table "public"."notifications" from "service_role";

revoke update on table "public"."notifications" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."project_escrows" from "anon";

revoke insert on table "public"."project_escrows" from "anon";

revoke references on table "public"."project_escrows" from "anon";

revoke select on table "public"."project_escrows" from "anon";

revoke trigger on table "public"."project_escrows" from "anon";

revoke truncate on table "public"."project_escrows" from "anon";

revoke update on table "public"."project_escrows" from "anon";

revoke delete on table "public"."project_escrows" from "authenticated";

revoke insert on table "public"."project_escrows" from "authenticated";

revoke references on table "public"."project_escrows" from "authenticated";

revoke select on table "public"."project_escrows" from "authenticated";

revoke trigger on table "public"."project_escrows" from "authenticated";

revoke truncate on table "public"."project_escrows" from "authenticated";

revoke update on table "public"."project_escrows" from "authenticated";

revoke delete on table "public"."project_escrows" from "service_role";

revoke insert on table "public"."project_escrows" from "service_role";

revoke references on table "public"."project_escrows" from "service_role";

revoke select on table "public"."project_escrows" from "service_role";

revoke trigger on table "public"."project_escrows" from "service_role";

revoke truncate on table "public"."project_escrows" from "service_role";

revoke update on table "public"."project_escrows" from "service_role";

revoke delete on table "public"."project_members" from "anon";

revoke insert on table "public"."project_members" from "anon";

revoke references on table "public"."project_members" from "anon";

revoke select on table "public"."project_members" from "anon";

revoke trigger on table "public"."project_members" from "anon";

revoke truncate on table "public"."project_members" from "anon";

revoke update on table "public"."project_members" from "anon";

revoke delete on table "public"."project_members" from "authenticated";

revoke insert on table "public"."project_members" from "authenticated";

revoke references on table "public"."project_members" from "authenticated";

revoke select on table "public"."project_members" from "authenticated";

revoke trigger on table "public"."project_members" from "authenticated";

revoke truncate on table "public"."project_members" from "authenticated";

revoke update on table "public"."project_members" from "authenticated";

revoke delete on table "public"."project_members" from "service_role";

revoke insert on table "public"."project_members" from "service_role";

revoke references on table "public"."project_members" from "service_role";

revoke select on table "public"."project_members" from "service_role";

revoke trigger on table "public"."project_members" from "service_role";

revoke truncate on table "public"."project_members" from "service_role";

revoke update on table "public"."project_members" from "service_role";

revoke delete on table "public"."project_pitch" from "anon";

revoke insert on table "public"."project_pitch" from "anon";

revoke references on table "public"."project_pitch" from "anon";

revoke select on table "public"."project_pitch" from "anon";

revoke trigger on table "public"."project_pitch" from "anon";

revoke truncate on table "public"."project_pitch" from "anon";

revoke update on table "public"."project_pitch" from "anon";

revoke delete on table "public"."project_pitch" from "authenticated";

revoke insert on table "public"."project_pitch" from "authenticated";

revoke references on table "public"."project_pitch" from "authenticated";

revoke select on table "public"."project_pitch" from "authenticated";

revoke trigger on table "public"."project_pitch" from "authenticated";

revoke truncate on table "public"."project_pitch" from "authenticated";

revoke update on table "public"."project_pitch" from "authenticated";

revoke delete on table "public"."project_pitch" from "service_role";

revoke insert on table "public"."project_pitch" from "service_role";

revoke references on table "public"."project_pitch" from "service_role";

revoke select on table "public"."project_pitch" from "service_role";

revoke trigger on table "public"."project_pitch" from "service_role";

revoke truncate on table "public"."project_pitch" from "service_role";

revoke update on table "public"."project_pitch" from "service_role";

revoke delete on table "public"."project_tag_relationships" from "anon";

revoke insert on table "public"."project_tag_relationships" from "anon";

revoke references on table "public"."project_tag_relationships" from "anon";

revoke select on table "public"."project_tag_relationships" from "anon";

revoke trigger on table "public"."project_tag_relationships" from "anon";

revoke truncate on table "public"."project_tag_relationships" from "anon";

revoke update on table "public"."project_tag_relationships" from "anon";

revoke delete on table "public"."project_tag_relationships" from "authenticated";

revoke insert on table "public"."project_tag_relationships" from "authenticated";

revoke references on table "public"."project_tag_relationships" from "authenticated";

revoke select on table "public"."project_tag_relationships" from "authenticated";

revoke trigger on table "public"."project_tag_relationships" from "authenticated";

revoke truncate on table "public"."project_tag_relationships" from "authenticated";

revoke update on table "public"."project_tag_relationships" from "authenticated";

revoke delete on table "public"."project_tag_relationships" from "service_role";

revoke insert on table "public"."project_tag_relationships" from "service_role";

revoke references on table "public"."project_tag_relationships" from "service_role";

revoke select on table "public"."project_tag_relationships" from "service_role";

revoke trigger on table "public"."project_tag_relationships" from "service_role";

revoke truncate on table "public"."project_tag_relationships" from "service_role";

revoke update on table "public"."project_tag_relationships" from "service_role";

revoke delete on table "public"."project_tags" from "anon";

revoke insert on table "public"."project_tags" from "anon";

revoke references on table "public"."project_tags" from "anon";

revoke select on table "public"."project_tags" from "anon";

revoke trigger on table "public"."project_tags" from "anon";

revoke truncate on table "public"."project_tags" from "anon";

revoke update on table "public"."project_tags" from "anon";

revoke delete on table "public"."project_tags" from "authenticated";

revoke insert on table "public"."project_tags" from "authenticated";

revoke references on table "public"."project_tags" from "authenticated";

revoke select on table "public"."project_tags" from "authenticated";

revoke trigger on table "public"."project_tags" from "authenticated";

revoke truncate on table "public"."project_tags" from "authenticated";

revoke update on table "public"."project_tags" from "authenticated";

revoke delete on table "public"."project_tags" from "service_role";

revoke insert on table "public"."project_tags" from "service_role";

revoke references on table "public"."project_tags" from "service_role";

revoke select on table "public"."project_tags" from "service_role";

revoke trigger on table "public"."project_tags" from "service_role";

revoke truncate on table "public"."project_tags" from "service_role";

revoke update on table "public"."project_tags" from "service_role";

revoke delete on table "public"."project_updates" from "anon";

revoke insert on table "public"."project_updates" from "anon";

revoke references on table "public"."project_updates" from "anon";

revoke select on table "public"."project_updates" from "anon";

revoke trigger on table "public"."project_updates" from "anon";

revoke truncate on table "public"."project_updates" from "anon";

revoke update on table "public"."project_updates" from "anon";

revoke delete on table "public"."project_updates" from "authenticated";

revoke insert on table "public"."project_updates" from "authenticated";

revoke references on table "public"."project_updates" from "authenticated";

revoke select on table "public"."project_updates" from "authenticated";

revoke trigger on table "public"."project_updates" from "authenticated";

revoke truncate on table "public"."project_updates" from "authenticated";

revoke update on table "public"."project_updates" from "authenticated";

revoke delete on table "public"."project_updates" from "service_role";

revoke insert on table "public"."project_updates" from "service_role";

revoke references on table "public"."project_updates" from "service_role";

revoke select on table "public"."project_updates" from "service_role";

revoke trigger on table "public"."project_updates" from "service_role";

revoke truncate on table "public"."project_updates" from "service_role";

revoke update on table "public"."project_updates" from "service_role";

revoke delete on table "public"."projects" from "anon";

revoke insert on table "public"."projects" from "anon";

revoke references on table "public"."projects" from "anon";

revoke select on table "public"."projects" from "anon";

revoke trigger on table "public"."projects" from "anon";

revoke truncate on table "public"."projects" from "anon";

revoke update on table "public"."projects" from "anon";

revoke delete on table "public"."projects" from "authenticated";

revoke insert on table "public"."projects" from "authenticated";

revoke references on table "public"."projects" from "authenticated";

revoke select on table "public"."projects" from "authenticated";

revoke trigger on table "public"."projects" from "authenticated";

revoke truncate on table "public"."projects" from "authenticated";

revoke update on table "public"."projects" from "authenticated";

revoke delete on table "public"."projects" from "service_role";

revoke insert on table "public"."projects" from "service_role";

revoke references on table "public"."projects" from "service_role";

revoke select on table "public"."projects" from "service_role";

revoke trigger on table "public"."projects" from "service_role";

revoke truncate on table "public"."projects" from "service_role";

revoke update on table "public"."projects" from "service_role";

revoke delete on table "public"."waitlist_interests" from "anon";

revoke insert on table "public"."waitlist_interests" from "anon";

revoke references on table "public"."waitlist_interests" from "anon";

revoke select on table "public"."waitlist_interests" from "anon";

revoke trigger on table "public"."waitlist_interests" from "anon";

revoke truncate on table "public"."waitlist_interests" from "anon";

revoke update on table "public"."waitlist_interests" from "anon";

revoke delete on table "public"."waitlist_interests" from "authenticated";

revoke insert on table "public"."waitlist_interests" from "authenticated";

revoke references on table "public"."waitlist_interests" from "authenticated";

revoke select on table "public"."waitlist_interests" from "authenticated";

revoke trigger on table "public"."waitlist_interests" from "authenticated";

revoke truncate on table "public"."waitlist_interests" from "authenticated";

revoke update on table "public"."waitlist_interests" from "authenticated";

revoke delete on table "public"."waitlist_interests" from "service_role";

revoke insert on table "public"."waitlist_interests" from "service_role";

revoke references on table "public"."waitlist_interests" from "service_role";

revoke select on table "public"."waitlist_interests" from "service_role";

revoke trigger on table "public"."waitlist_interests" from "service_role";

revoke truncate on table "public"."waitlist_interests" from "service_role";

revoke update on table "public"."waitlist_interests" from "service_role";

alter table "public"."comments" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."community" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."contributions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."escrow_contracts" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."escrow_reviews" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."escrow_status" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."milestones" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."projects" alter column "id" set default extensions.uuid_generate_v4();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_kyc_admin(target_user_id uuid, admin_notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    PERFORM 1 FROM kyc_admin_whitelist WHERE user_id = auth.uid();
    IF NOT FOUND THEN
        RAISE EXCEPTION 'permission denied: caller is not a KYC admin' USING ERRCODE = '42501';
    END IF;

    INSERT INTO kyc_admin_whitelist (user_id, created_by, notes)
    VALUES (target_user_id, auth.uid(), admin_notes)
    ON CONFLICT (user_id) DO UPDATE SET
        notes = EXCLUDED.notes,
        created_by = auth.uid(),
        created_at = NOW();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_expired_challenges()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM "public"."challenges" 
    WHERE "expires_at" < now();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  BEGIN
    -- Log the trigger execution for debugging
    RAISE LOG 'create_profile_for_new_user trigger fired for user_id: %', NEW.id;
    
    -- Insert new profile with conflict resolution
    INSERT INTO public.profiles (id, email)
    VALUES (
      NEW.id,
      NEW.email
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      updated_at = now();
    
    RAISE LOG 'Profile created/updated for user_id: %', NEW.id;
    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log any errors that occur
      RAISE LOG 'Error in create_profile_for_new_user: % %', SQLERRM, SQLSTATE;
      -- Re-raise the exception to prevent the user creation if profile creation fails
      RAISE;
  END;
  $function$
;

CREATE OR REPLACE FUNCTION public.delete_orphan_tag_if_unused()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Delete the tag only if it's not referenced in any project_tag_relationships
  DELETE FROM project_tags
  WHERE id = OLD.tag_id
    AND NOT EXISTS (
      SELECT 1
      FROM project_tag_relationships
      WHERE tag_id = OLD.tag_id
    );

  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_project_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    base_slug TEXT;
    suffix INT := 1;
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        base_slug := regexp_replace(
                        regexp_replace(
                            lower(unaccent(NEW.title)),
                            '&', 'and', 'g'
                        ),
                        '[^a-z0-9]+', '-', 'g'
                     );
        NEW.slug := base_slug;

        WHILE EXISTS (SELECT 1 FROM public.projects WHERE slug = NEW.slug AND id <> NEW.id) LOOP
            NEW.slug := base_slug || '-' || suffix;
            suffix := suffix + 1;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_slug()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.slug := regexp_replace(
    regexp_replace(
      lower(unaccent(NEW.name)),
      '&', 'and', 'g'
    ),
    '[^a-z0-9]+', '-', 'g'
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_next_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Ensure all required columns in public.profiles are handled
    INSERT INTO public.profiles (id, next_auth_user_id, email, display_name)
    VALUES (NEW.id, NEW.id, NEW.email, COALESCE(NEW.name, 'Anonymous'));
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_notification_retry()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    backoff_seconds INTEGER;
BEGIN
    -- Calculate exponential backoff (2^attempts * 60 seconds, max 24 hours)
    backoff_seconds := LEAST((POWER(2, NEW.delivery_attempts) * 60)::INTEGER, 86400);
    
    -- Set next retry time
    NEW.next_retry_at := NOW() + (backoff_seconds || ' seconds')::interval;
    
    -- Update delivery status
    IF NEW.delivery_attempts >= 5 THEN
        NEW.delivery_status := 'failed';
    ELSE
        NEW.delivery_status := 'pending';
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.projects_append_version()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  old_snapshot jsonb;
  new_snapshot jsonb;

  prev_hash text;
  curr_hash text;

  actor uuid;
  changed_fields jsonb;
  entry jsonb;
begin
  -- build canonical snapshots (excluding volatile fields)
  old_snapshot := jsonb_strip_nulls(to_jsonb(old) - array['metadata','created_at','updated_at']);
  new_snapshot := jsonb_strip_nulls(to_jsonb(new) - array['metadata','created_at','updated_at']);

  -- if nothing relevant changed, skip
  if old_snapshot is not distinct from new_snapshot then
    return new;
  end if;

  -- compute hashes
  prev_hash := 'sha256:' || encode(extensions.digest(old_snapshot::text, 'sha256'), 'hex');
  curr_hash := 'sha256:' || encode(extensions.digest(new_snapshot::text, 'sha256'), 'hex');

  -- resolve actor from the authenticated user id (UUID)
  actor := coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), '')::uuid,
    nullif(
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'),
      ''
    )::uuid
  );

  -- detect changed fields by comparing key/value pairs
  changed_fields := coalesce((
    with
      e_old as (select key, value from jsonb_each(old_snapshot)),
      e_new as (select key, value from jsonb_each(new_snapshot))
    select jsonb_agg(k)
    from (
      select o.key as k
      from e_old o
      left join e_new n on n.key = o.key
      where o.value is distinct from n.value

      union

      select n.key as k
      from e_new n
      left join e_old o on o.key = n.key
      where n.value is distinct from o.value
    ) diff
  ), '[]'::jsonb);

  -- build version entry
  entry := jsonb_build_object(
    'prev_row_hash', prev_hash,
    'snapshot', old_snapshot,
    'changed_fields', changed_fields,
    'changed_by', actor,
    'changed_at', now()
  );

  -- ensure metadata exists
  new.metadata := coalesce(new.metadata, '{}'::jsonb);

  -- append entry to versions[]
  new.metadata := jsonb_set(
                    new.metadata,
                    '{versions}',
                    coalesce(new.metadata->'versions', '[]'::jsonb) || jsonb_build_array(entry),
                    true
                  );

  -- update current_row_hash
  new.metadata := jsonb_set(
                    new.metadata,
                    '{current_row_hash}',
                    to_jsonb(curr_hash),
                    true
                  );

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.projects_set_initial_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  new_snapshot jsonb;
  curr_hash text;
begin
  -- canonical snapshot of the incoming row (excluding volatile fields)
  new_snapshot := jsonb_strip_nulls(to_jsonb(new) - array['metadata','created_at','updated_at']);

  -- compute hash for the snapshot
  curr_hash := 'sha256:' ||
               encode(
                 extensions.digest(new_snapshot::text, 'sha256'),
                 'hex'
               );

  -- ensure metadata exists
  new.metadata := coalesce(new.metadata, '{}'::jsonb);

  -- ensure versions array exists
  new.metadata := jsonb_set(
                    new.metadata,
                    '{versions}',
                    coalesce(new.metadata->'versions', '[]'::jsonb),
                    true
                  );

  -- set current_row_hash
  new.metadata := jsonb_set(
                    new.metadata,
                    '{current_row_hash}',
                    to_jsonb(curr_hash),
                    true
                  );

  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.remove_kyc_admin(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    PERFORM 1 FROM kyc_admin_whitelist WHERE user_id = auth.uid();
    IF NOT FOUND THEN
        RAISE EXCEPTION 'permission denied: caller is not a KYC admin' USING ERRCODE = '42501';
    END IF;

    DELETE FROM kyc_admin_whitelist WHERE user_id = target_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_project_member_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at := now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_devices_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_project_on_investment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.projects
    SET
        current_amount = current_amount + NEW.amount,
        percentage_complete = CASE
          WHEN target_amount > 0 THEN LEAST((current_amount + NEW.amount) / target_amount * 100, 100)
          ELSE 0
        END,
        kinder_count = kinder_count + 1
    WHERE id = NEW.project_id;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_question_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Enhanced with null guard
  IF NEW.type = 'answer' AND NEW.parent_comment_id IS NOT NULL THEN
    -- Update the parent question's status to 'answered' if it was 'new'
    UPDATE comments
    SET metadata = jsonb_set(
      metadata,
      '{status}',
      to_jsonb('answered'::text),
      true
    )
    WHERE id = NEW.parent_comment_id
    AND type = 'question'
    AND (metadata->>'status' = 'new' OR metadata->>'status' IS NULL);
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_min_investment()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    min_invest DECIMAL(12, 2);
BEGIN
    -- Fetch the minimum investment amount for the project
    SELECT min_investment INTO min_invest
    FROM public.projects
    WHERE id = NEW.project_id;

    -- Validate the investment amount
    IF NEW.amount < min_invest THEN
        RAISE EXCEPTION 'Investment amount must be at least %', min_invest;
    END IF;

    RETURN NEW;
END;
$function$
;


