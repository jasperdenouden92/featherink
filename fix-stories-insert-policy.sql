-- Fix Stories Insert RLS Policy
-- The current policy might be failing because auth.uid() check isn't working properly
-- Run this in your Supabase SQL editor

-- Drop the existing policy
drop policy if exists "insert stories for authenticated" on stories;

-- Create a new policy that properly checks authentication
-- This ensures authenticated users can insert stories where they are the creator
create policy "insert stories for authenticated"
on stories for insert 
to authenticated
with check (
  created_by = auth.uid() 
  AND auth.uid() IS NOT NULL
);

-- Alternative: If the above still doesn't work, you can temporarily use this more permissive policy:
-- (But this is less secure, so only use if needed)
-- create policy "insert stories for authenticated"
-- on stories for insert 
-- to authenticated
-- with check (true);
