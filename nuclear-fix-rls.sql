-- NUCLEAR FIX - Complete RLS Reset for Stories Table
-- This will completely remove ALL policies and recreate them
-- Run this in your Supabase SQL editor

-- ============================================
-- STEP 1: Remove ALL existing policies on stories
-- ============================================
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
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON stories';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- ============================================
-- STEP 2: Ensure RLS is enabled
-- ============================================
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Create a completely permissive INSERT policy
-- ============================================
-- This policy has NO restrictions - any authenticated user can insert
CREATE POLICY "stories_insert_any_authenticated"
ON stories 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- ============================================
-- STEP 4: Create other necessary policies
-- ============================================
-- Read policy for participants
CREATE POLICY "stories_select_participants"
ON stories 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM story_participants 
    WHERE story_participants.story_id = stories.id 
    AND story_participants.user_id = auth.uid()
  )
);

-- Update policy for creators
CREATE POLICY "stories_update_creators"
ON stories 
FOR UPDATE 
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Delete policy for creators
CREATE POLICY "stories_delete_creators"
ON stories 
FOR DELETE 
TO authenticated
USING (created_by = auth.uid());

-- ============================================
-- STEP 5: Verify policies were created
-- ============================================
SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN with_check IS NULL THEN 'NULL'
        WHEN with_check = 'true' THEN 'true (permissive)'
        ELSE with_check::text
    END as with_check_clause,
    CASE 
        WHEN qual IS NULL THEN 'NULL'
        ELSE qual::text
    END as using_clause
FROM pg_policies 
WHERE tablename = 'stories'
ORDER BY cmd, policyname;

-- ============================================
-- STEP 6: Test the policy (optional)
-- ============================================
-- You can test if you're authenticated by running:
-- SELECT auth.uid() as current_user_id;
-- 
-- If this returns NULL, your session isn't being recognized
-- If it returns a UUID, your session is working
