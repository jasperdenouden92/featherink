-- Featherink Database Setup Script
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create tables
create table stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table story_participants (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  unique (story_id, user_id)
);

create table characters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  bio text,
  avatar_url text,
  created_at timestamptz default now()
);

create table story_days (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade,
  day_number int not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique (story_id, day_number)
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade,
  day_id uuid references story_days(id) on delete cascade,
  character_id uuid references characters(id) on delete set null,
  title text,
  content text not null,
  created_at timestamptz default now()
);

create table end_of_day_declarations (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references stories(id) on delete cascade,
  day_id uuid references story_days(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  declared_at timestamptz default now(),
  unique (day_id, user_id)
);

-- Enable Row Level Security
alter table stories enable row level security;
alter table story_participants enable row level security;
alter table characters enable row level security;
alter table story_days enable row level security;
alter table posts enable row level security;
alter table end_of_day_declarations enable row level security;

-- Stories policies
create policy "read stories for participants"
on stories for select
using (exists (select 1 from story_participants sp where sp.story_id = stories.id and sp.user_id = auth.uid()));

create policy "insert stories for authenticated"
on stories for insert to authenticated
with check (created_by = auth.uid());

create policy "update stories for creators"
on stories for update
using (created_by = auth.uid());

create policy "delete stories for creators"
on stories for delete
using (created_by = auth.uid());

-- Story participants policies
create policy "read story_participants for participants"
on story_participants for select
using (user_id = auth.uid() or exists (select 1 from story_participants sp where sp.story_id = story_participants.story_id and sp.user_id = auth.uid()));

create policy "insert story_participants for authenticated"
on story_participants for insert to authenticated
with check (user_id = auth.uid());

-- Characters policies
create policy "read characters for story participants"
on characters for select
using (exists (select 1 from story_participants sp where sp.story_id = characters.story_id and sp.user_id = auth.uid()));

create policy "insert characters for story participants"
on characters for insert to authenticated
with check (user_id = auth.uid() and exists (select 1 from story_participants sp where sp.story_id = characters.story_id and sp.user_id = auth.uid()));

create policy "update characters for owners"
on characters for update
using (user_id = auth.uid());

create policy "delete characters for owners"
on characters for delete
using (user_id = auth.uid());

-- Story days policies
create policy "read story_days for story participants"
on story_days for select
using (exists (select 1 from story_participants sp where sp.story_id = story_days.story_id and sp.user_id = auth.uid()));

create policy "insert story_days for story participants"
on story_days for insert to authenticated
with check (exists (select 1 from story_participants sp where sp.story_id = story_days.story_id and sp.user_id = auth.uid()));

create policy "update story_days for story participants"
on story_days for update
using (exists (select 1 from story_participants sp where sp.story_id = story_days.story_id and sp.user_id = auth.uid()));

-- Posts policies
create policy "read posts for story participants"
on posts for select
using (exists (select 1 from story_participants sp where sp.story_id = posts.story_id and sp.user_id = auth.uid()));

create policy "insert posts for story participants"
on posts for insert to authenticated
with check (exists (select 1 from story_participants sp where sp.story_id = posts.story_id and sp.user_id = auth.uid()));

create policy "update posts for character owners"
on posts for update
using (exists (select 1 from characters c where c.id = posts.character_id and c.user_id = auth.uid()));

create policy "delete posts for character owners"
on posts for delete
using (exists (select 1 from characters c where c.id = posts.character_id and c.user_id = auth.uid()));

-- End of day declarations policies
create policy "read end_of_day_declarations for story participants"
on end_of_day_declarations for select
using (exists (select 1 from story_participants sp where sp.story_id = end_of_day_declarations.story_id and sp.user_id = auth.uid()));

create policy "insert end_of_day_declarations for story participants"
on end_of_day_declarations for insert to authenticated
with check (user_id = auth.uid() and exists (select 1 from story_participants sp where sp.story_id = end_of_day_declarations.story_id and sp.user_id = auth.uid()));

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage policies for avatars
create policy "Avatar images are publicly accessible"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Users can upload avatar images"
on storage.objects for insert
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar images"
on storage.objects for update
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar images"
on storage.objects for delete
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
