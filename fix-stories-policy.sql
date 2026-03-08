-- Fix Stories RLS Policy
-- Run this in your Supabase SQL editor

-- Drop the problematic stories policy
drop policy if exists "insert stories for authenticated" on stories;

-- Create a simpler policy that allows authenticated users to create stories
create policy "insert stories for authenticated"
on stories for insert to authenticated
with check (true);
