-- FORCE FIX for Stories RLS Policy
-- This will completely remove and recreate the policy
-- Run this in your Supabase SQL editor

-- Step 1: Drop ALL existing policies on stories table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'stories') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON stories';
    END LOOP;
END $$;

-- Step 2: Verify RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Step 3: Create a simple, permissive insert policy
-- This allows ANY authenticated user to insert stories
CREATE POLICY "allow_authenticated_insert_stories"
ON stories FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 4: Verify the policy was created
-- You can check this by running:
-- SELECT * FROM pg_policies WHERE tablename = 'stories';

-- Step 5: Also ensure other policies exist for reading/updating
CREATE POLICY "allow_participants_read_stories"
ON stories FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM story_participants 
    WHERE story_participants.story_id = stories.id 
    AND story_participants.user_id = auth.uid()
  )
);

CREATE POLICY "allow_creators_update_stories"
ON stories FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "allow_creators_delete_stories"
ON stories FOR DELETE
TO authenticated
USING (created_by = auth.uid());
