-- Fix RLS Policies Only (Tables Already Exist)
-- Run this in your Supabase SQL editor

-- Drop existing problematic policies
drop policy if exists "read story_participants for participants" on story_participants;
drop policy if exists "insert story_participants for authenticated" on story_participants;

-- Create fixed policies without recursion
create policy "read story_participants for participants"
on story_participants for select
using (user_id = auth.uid());

create policy "insert story_participants for authenticated"
on story_participants for insert to authenticated
with check (user_id = auth.uid());
