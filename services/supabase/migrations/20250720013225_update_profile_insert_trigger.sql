CREATE OR REPLACE FUNCTION "public"."create_profile_for_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
  $$;

-- Create the missing trigger on auth.users table
DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
CREATE TRIGGER "on_auth_user_created"
  AFTER INSERT ON "auth"."users"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."create_profile_for_new_user"();
