-- Complete Fix for Stories RLS Policy
-- Run this in your Supabase SQL editor to fix the story creation issue

-- Drop the existing policy
drop policy if exists "insert stories for authenticated" on stories;

-- Recreate the policy with explicit null check
-- This ensures authenticated users can insert stories where they are the creator
create policy "insert stories for authenticated"
on stories for insert 
to authenticated
with check (
  created_by = auth.uid() 
  AND auth.uid() IS NOT NULL
);

-- Verify the policy was created
-- You can check this in Supabase dashboard under Authentication > Policies
