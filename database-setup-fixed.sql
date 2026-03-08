-- Featherink Database Setup Script (Fixed RLS Policies)
-- Run this in your Supabase SQL editor

-- First, drop existing policies to avoid conflicts
drop policy if exists "read stories for participants" on stories;
drop policy if exists "insert stories for authenticated" on stories;
drop policy if exists "update stories for creators" on stories;
drop policy if exists "delete stories for creators" on stories;

drop policy if exists "read story_participants for participants" on story_participants;
drop policy if exists "insert story_participants for authenticated" on story_participants;

drop policy if exists "read characters for story participants" on characters;
drop policy if exists "insert characters for story participants" on characters;
drop policy if exists "update characters for owners" on characters;
drop policy if exists "delete characters for owners" on characters;

drop policy if exists "read story_days for story participants" on story_days;
drop policy if exists "insert story_days for story participants" on story_days;
drop policy if exists "update story_days for story participants" on story_days;

drop policy if exists "read posts for story participants" on posts;
drop policy if exists "insert posts for story participants" on posts;
drop policy if exists "update posts for character owners" on posts;
drop policy if exists "delete posts for character owners" on posts;

drop policy if exists "read end_of_day_declarations for story participants" on end_of_day_declarations;
drop policy if exists "insert end_of_day_declarations for story participants" on end_of_day_declarations;

-- Create fixed policies without recursion

-- Stories policies
create policy "read stories for participants"
on stories for select
using (exists (
  select 1 from story_participants 
  where story_participants.story_id = stories.id 
  and story_participants.user_id = auth.uid()
));

create policy "insert stories for authenticated"
on stories for insert to authenticated
with check (created_by = auth.uid());

create policy "update stories for creators"
on stories for update
using (created_by = auth.uid());

create policy "delete stories for creators"
on stories for delete
using (created_by = auth.uid());

-- Story participants policies (simplified to avoid recursion)
create policy "read story_participants for participants"
on story_participants for select
using (user_id = auth.uid());

create policy "insert story_participants for authenticated"
on story_participants for insert to authenticated
with check (user_id = auth.uid());

-- Characters policies
create policy "read characters for story participants"
on characters for select
using (exists (
  select 1 from story_participants 
  where story_participants.story_id = characters.story_id 
  and story_participants.user_id = auth.uid()
));

create policy "insert characters for story participants"
on characters for insert to authenticated
with check (
  user_id = auth.uid() 
  and exists (
    select 1 from story_participants 
    where story_participants.story_id = characters.story_id 
    and story_participants.user_id = auth.uid()
  )
);

create policy "update characters for owners"
on characters for update
using (user_id = auth.uid());

create policy "delete characters for owners"
on characters for delete
using (user_id = auth.uid());

-- Story days policies
create policy "read story_days for story participants"
on story_days for select
using (exists (
  select 1 from story_participants 
  where story_participants.story_id = story_days.story_id 
  and story_participants.user_id = auth.uid()
));

create policy "insert story_days for story participants"
on story_days for insert to authenticated
with check (exists (
  select 1 from story_participants 
  where story_participants.story_id = story_days.story_id 
  and story_participants.user_id = auth.uid()
));

create policy "update story_days for story participants"
on story_days for update
using (exists (
  select 1 from story_participants 
  where story_participants.story_id = story_days.story_id 
  and story_participants.user_id = auth.uid()
));

-- Posts policies
create policy "read posts for story participants"
on posts for select
using (exists (
  select 1 from story_participants 
  where story_participants.story_id = posts.story_id 
  and story_participants.user_id = auth.uid()
));

create policy "insert posts for story participants"
on posts for insert to authenticated
with check (exists (
  select 1 from story_participants 
  where story_participants.story_id = posts.story_id 
  and story_participants.user_id = auth.uid()
));

create policy "update posts for character owners"
on posts for update
using (exists (
  select 1 from characters 
  where characters.id = posts.character_id 
  and characters.user_id = auth.uid()
));

create policy "delete posts for character owners"
on posts for delete
using (exists (
  select 1 from characters 
  where characters.id = posts.character_id 
  and characters.user_id = auth.uid()
));

-- End of day declarations policies
create policy "read end_of_day_declarations for story participants"
on end_of_day_declarations for select
using (exists (
  select 1 from story_participants 
  where story_participants.story_id = end_of_day_declarations.story_id 
  and story_participants.user_id = auth.uid()
));

create policy "insert end_of_day_declarations for story participants"
on end_of_day_declarations for insert to authenticated
with check (
  user_id = auth.uid() 
  and exists (
    select 1 from story_participants 
    where story_participants.story_id = end_of_day_declarations.story_id 
    and story_participants.user_id = auth.uid()
  )
);
