/* 
  migration: update user references to NextAuth (next_auth.users)
  purpose:
    - Repoint all user-related foreign keys from auth.users(id) to next_auth.users(id).
    - Ensure reviewer defaults and helper functions use next_auth.uid() (verified identity).
  affected objects:
    - FKs: projects.kindler_id, project_updates.author_id, comments.author_id,
           kyc_admin_whitelist.user_id, kyc_admin_whitelist.created_by,
           kyc_reviews.user_id, kyc_reviews.reviewer_id,
           notifications.user_id, notification_preferences.user_id
    - functions: public.add_kyc_admin, public.remove_kyc_admin
*/

-- Update foreign key to use next_auth.users
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_kindler_id_fkey;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_kindler_id_fkey
  FOREIGN KEY (kindler_id)
  REFERENCES next_auth.users(id)
  ON DELETE RESTRICT;

-- project_updates: update FK to next_auth.users
ALTER TABLE public.project_updates
  DROP CONSTRAINT IF EXISTS project_updates_author_id_fkey;

ALTER TABLE public.project_updates
  ADD CONSTRAINT project_updates_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

-- comments: update FK to next_auth.users
ALTER TABLE public.comments
  DROP CONSTRAINT IF EXISTS comments_author_id_fkey;

ALTER TABLE public.comments
  ADD CONSTRAINT comments_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

-- kyc_admin_whitelist: update FKs to next_auth.users
ALTER TABLE public.kyc_admin_whitelist
  DROP CONSTRAINT IF EXISTS kyc_admin_whitelist_user_id_fkey,
  DROP CONSTRAINT IF EXISTS kyc_admin_whitelist_created_by_fkey;

ALTER TABLE public.kyc_admin_whitelist
  ADD CONSTRAINT kyc_admin_whitelist_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT kyc_admin_whitelist_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES next_auth.users(id) ON DELETE SET NULL;

-- kyc_reviews: update FKs to next_auth.users and default reviewer to next_auth.uid()
ALTER TABLE public.kyc_reviews
  DROP CONSTRAINT IF EXISTS kyc_reviews_user_id_fkey,
  DROP CONSTRAINT IF EXISTS kyc_reviews_reviewer_id_fkey;

ALTER TABLE public.kyc_reviews
  ADD CONSTRAINT kyc_reviews_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT kyc_reviews_reviewer_id_fkey
    FOREIGN KEY (reviewer_id) REFERENCES next_auth.users(id) ON DELETE SET NULL;

-- reviewer_id default bound to authenticated user (NextAuth)
ALTER TABLE public.kyc_reviews
  ALTER COLUMN reviewer_id SET DEFAULT next_auth.uid();

-- kyc admin helpers: switch to next_auth.uid() for caller checks and created_by
CREATE OR REPLACE FUNCTION public.add_kyc_admin(target_user_id UUID, admin_notes TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM 1 FROM public.kyc_admin_whitelist WHERE user_id = (SELECT next_auth.uid());
  IF NOT FOUND THEN
    RAISE EXCEPTION 'permission denied: caller is not a KYC admin' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.kyc_admin_whitelist (user_id, created_by, notes)
  VALUES (target_user_id, (SELECT next_auth.uid()), admin_notes)
  ON CONFLICT (user_id) DO UPDATE SET
    notes = EXCLUDED.notes,
    created_by = (SELECT next_auth.uid()),
    created_at = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_kyc_admin(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM 1 FROM public.kyc_admin_whitelist WHERE user_id = (SELECT next_auth.uid());
  IF NOT FOUND THEN
    RAISE EXCEPTION 'permission denied: caller is not a KYC admin' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.kyc_admin_whitelist WHERE user_id = target_user_id;
END;
$$;

-- notifications: update FKs to next_auth.users
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;

-- notification_preferences: update FKs to next_auth.users
ALTER TABLE public.notification_preferences
  DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;

ALTER TABLE public.notification_preferences
  ADD CONSTRAINT notification_preferences_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES next_auth.users(id) ON DELETE CASCADE;
