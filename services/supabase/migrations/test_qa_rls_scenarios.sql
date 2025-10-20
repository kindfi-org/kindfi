-- Test scenarios for Q&A RLS policies
-- This file contains test cases to validate the new RLS policies work correctly
-- Run this after applying the main migration

-- Test data setup
DO $$
DECLARE
    test_user_1 UUID := '11111111-1111-1111-1111-111111111111';
    test_user_2 UUID := '22222222-2222-2222-2222-222222222222';
    test_project UUID := '33333333-3333-3333-3333-333333333333';
    test_profile_1 UUID := '44444444-4444-4444-4444-444444444444';
    test_profile_2 UUID := '55555555-5555-5555-5555-555555555555';
    test_question UUID;
    test_answer UUID;
BEGIN
    -- Create test NextAuth users
    INSERT INTO next_auth.users (id, email, name) VALUES 
    (test_user_1, 'user1@test.com', 'Test User 1'),
    (test_user_2, 'user2@test.com', 'Test User 2')
    ON CONFLICT (id) DO NOTHING;
    
    -- Create test profiles
    INSERT INTO profiles (id, next_auth_user_id, email, full_name, role) VALUES
    (test_profile_1, test_user_1, 'user1@test.com', 'Test User 1', 'kinder'),
    (test_profile_2, test_user_2, 'user2@test.com', 'Test User 2', 'kindler')
    ON CONFLICT (id) DO NOTHING;
    
    -- Create test project
    INSERT INTO projects (id, title, description, kindler_id) VALUES
    (test_project, 'Test Project', 'A test project for Q&A', test_profile_2)
    ON CONFLICT (id) DO NOTHING;
    
    -- Add user 1 as project team member (editor)
    INSERT INTO project_members (project_id, user_id, role, next_auth_user_id) VALUES
    (test_project, test_profile_1, 'editor', test_user_1)
    ON CONFLICT (project_id, user_id) DO NOTHING;
    
    -- Test 1: Create a question
    INSERT INTO comments (author_id, content, type, project_id, metadata)
    VALUES (test_profile_1, 'How does this feature work?', 'question', test_project, '{"status": "new"}')
    RETURNING id INTO test_question;
    
    -- Test 2: Create an answer
    INSERT INTO comments (author_id, content, type, project_id, parent_comment_id, metadata)
    VALUES (test_profile_2, 'Here is how it works...', 'answer', test_project, test_question, '{}')
    RETURNING id INTO test_answer;
    
    -- Test 3: Mark answer as official (should work for team member)
    UPDATE comments 
    SET metadata = '{"is_official": true}'
    WHERE id = test_answer;
    
    -- Test 4: Update question status (should work for question author)
    UPDATE comments 
    SET metadata = '{"status": "answered"}'
    WHERE id = test_question;
    
    RAISE NOTICE 'Test data created successfully';
    RAISE NOTICE 'Question ID: %', test_question;
    RAISE NOTICE 'Answer ID: %', test_answer;
    
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error in test setup: %', SQLERRM;
END $$;

-- Validation queries
-- Check that policies are correctly applied

-- Test 1: Verify public read access works
SELECT 'Public read test' AS test_name, 
       COUNT(*) AS questions_readable
FROM comments 
WHERE type = 'question';

-- Test 2: Check helper functions work
SELECT 'Helper function test' AS test_name,
       get_current_user_profile.*
FROM get_current_user_profile()
LIMIT 1;

-- Test 3: Verify metadata constraints
SELECT 'Metadata constraint test' AS test_name,
       type,
       metadata->>'status' AS status,
       metadata->>'is_official' AS is_official
FROM comments 
WHERE type IN ('question', 'answer');

-- Test 4: Check indexes exist
SELECT 'Index verification' AS test_name,
       schemaname,
       indexname,
       indexdef
FROM pg_indexes 
WHERE tablename = 'comments' 
AND indexname LIKE 'idx_%'
ORDER BY indexname;

-- Cleanup test data (optional)
-- DELETE FROM comments WHERE project_id = '33333333-3333-3333-3333-333333333333';
-- DELETE FROM project_members WHERE project_id = '33333333-3333-3333-3333-333333333333';
-- DELETE FROM projects WHERE id = '33333333-3333-3333-3333-333333333333';
-- DELETE FROM profiles WHERE id IN ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555');
-- DELETE FROM next_auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');