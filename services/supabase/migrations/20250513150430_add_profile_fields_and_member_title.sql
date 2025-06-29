-- Add profile fields to the public user profile table
ALTER TABLE profiles
ADD COLUMN display_name TEXT NOT NULL DEFAULT '', -- Full name shown across the app
ADD COLUMN bio TEXT DEFAULT '',         -- Short bio visible in the team section
ADD COLUMN image_url TEXT DEFAULT '';   -- Public image URL used as avatar

-- Add descriptive project title field to project members
ALTER TABLE project_members
ADD COLUMN title TEXT NOT NULL DEFAULT ''; -- Descriptive role within the project (e.g., "UX Designer", "Tech Lead")
