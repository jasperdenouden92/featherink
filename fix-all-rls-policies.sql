-- Complete RLS Policy Fix for Featherink
-- Run this in your Supabase SQL editor to fix all RLS issues

-- ============================================
-- 1. STORIES TABLE
-- ============================================
-- Drop existing policies
drop policy if exists "read stories for participants" on stories;
drop policy if exists "insert stories for authenticated" on stories;
drop policy if exists "update stories for creators" on stories;
drop policy if exists "delete stories for creators" on stories;

-- Create new policies
-- Allow authenticated users to read stories they participate in
create policy "read stories for participants"
on stories for select
to authenticated
using (exists (
  select 1 from story_participants 
  where story_participants.story_id = stories.id 
  and story_participants.user_id = auth.uid()
));

-- Allow ANY authenticated user to insert stories (we'll validate created_by in app)
create policy "insert stories for authenticated"
on stories for insert 
to authenticated
with check (true);

-- Allow story creators to update their stories
create policy "update stories for creators"
on stories for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- Allow story creators to delete their stories
create policy "delete stories for creators"
on stories for delete
to authenticated
using (created_by = auth.uid());

-- ============================================
-- 2. STORY_PARTICIPANTS TABLE
-- ============================================
drop policy if exists "read story_participants for participants" on story_participants;
drop policy if exists "insert story_participants for authenticated" on story_participants;

-- Allow users to read their own participant records
create policy "read story_participants for participants"
on story_participants for select
to authenticated
using (user_id = auth.uid());

-- Allow authenticated users to insert themselves as participants
create policy "insert story_participants for authenticated"
on story_participants for insert 
to authenticated
with check (user_id = auth.uid());

-- ============================================
-- 3. STORY_DAYS TABLE
-- ============================================
drop policy if exists "read story_days for story participants" on story_days;
drop policy if exists "insert story_days for story participants" on story_days;
drop policy if exists "update story_days for story participants" on story_days;

-- Allow participants to read days
create policy "read story_days for story participants"
on story_days for select
to authenticated
using (exists (
  select 1 from story_participants 
  where story_participants.story_id = story_days.story_id 
  and story_participants.user_id = auth.uid()
));

-- Allow participants OR story creators to insert days
create policy "insert story_days for story participants"
on story_days for insert 
to authenticated
with check (
  exists (
    select 1 from story_participants 
    where story_participants.story_id = story_days.story_id 
    and story_participants.user_id = auth.uid()
  )
  OR
  exists (
    select 1 from stories
    where stories.id = story_days.story_id
    and stories.created_by = auth.uid()
  )
);

-- Allow participants to update days
create policy "update story_days for story participants"
on story_days for update
to authenticated
using (exists (
  select 1 from story_participants 
  where story_participants.story_id = story_days.story_id 
  and story_participants.user_id = auth.uid()
));

-- ============================================
-- 4. VERIFY RLS IS ENABLED
-- ============================================
-- Make sure RLS is enabled on all tables
alter table stories enable row level security;
alter table story_participants enable row level security;
alter table story_days enable row level security;
alter table characters enable row level security;
alter table posts enable row level security;
alter table end_of_day_declarations enable row level security;

-- ============================================
-- VERIFICATION QUERIES (optional - run to check)
-- ============================================
-- Check if policies exist:
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE tablename IN ('stories', 'story_participants', 'story_days')
-- ORDER BY tablename, policyname;
