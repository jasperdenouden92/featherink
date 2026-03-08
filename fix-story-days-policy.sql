-- Fix the story_days insert policy to allow story creators to insert days
-- This fixes the issue where creating a story fails because the participant
-- insert and day insert happen in sequence, and the RLS check for days
-- requires a participant to exist.

-- Drop the existing policy
drop policy if exists "insert story_days for story participants" on story_days;

-- Create a new policy that allows both participants AND story creators to insert days
create policy "insert story_days for story participants"
on story_days for insert to authenticated
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
