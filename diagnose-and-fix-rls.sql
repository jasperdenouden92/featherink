-- DIAGNOSE AND FIX RLS ISSUES
-- Run this in your Supabase SQL editor

-- ============================================
-- STEP 1: Check current policies
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'stories'
ORDER BY policyname;

-- ============================================
-- STEP 2: Check if RLS is enabled
-- ============================================
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'stories';

-- ============================================
-- STEP 3: NUCLEAR OPTION - Remove ALL policies
-- ============================================
-- Uncomment the lines below if you want to completely reset

/*
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'stories'
    ) 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON stories CASCADE';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;
*/

-- ============================================
-- STEP 4: Create a fresh, simple policy
-- ============================================
-- Drop the specific policy we're trying to fix
DROP POLICY IF EXISTS "insert stories for authenticated" ON stories;
DROP POLICY IF EXISTS "allow_authenticated_insert_stories" ON stories;

-- Create a new policy with a unique name
CREATE POLICY "stories_insert_authenticated_v2"
ON stories FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- STEP 5: Verify it was created
-- ============================================
SELECT 
    policyname,
    cmd,
    with_check
FROM pg_policies 
WHERE tablename = 'stories' 
AND cmd = 'INSERT';

-- ============================================
-- STEP 6: Test query (run as authenticated user)
-- ============================================
-- This should work if you're authenticated:
-- INSERT INTO stories (title, description, created_by) 
-- VALUES ('Test Story', 'Test Description', auth.uid())
-- RETURNING *;
