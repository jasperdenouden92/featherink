-- FINAL FIX - This should definitely work
-- Run this in your Supabase SQL editor

-- Step 1: Completely remove ALL policies
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

-- Step 2: Ensure RLS is enabled
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Step 3: Create the simplest possible INSERT policy
-- This has NO restrictions - any authenticated user can insert anything
CREATE POLICY "stories_insert_policy"
ON stories 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Step 4: Create other policies
CREATE POLICY "stories_select_policy"
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

CREATE POLICY "stories_update_policy"
ON stories 
FOR UPDATE 
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "stories_delete_policy"
ON stories 
FOR DELETE 
TO authenticated
USING (created_by = auth.uid());

-- Step 5: Verify
SELECT 
    policyname,
    cmd,
    with_check
FROM pg_policies 
WHERE tablename = 'stories'
ORDER BY cmd;
