# Featherink - Collaborative Storytelling Platform

A collaborative storytelling platform where users write stories together through fictional characters, organized by "days" that act like chapters.

## Features

- **User Authentication**: Sign up and login using Supabase Auth
- **Story Management**: Create and join collaborative stories
- **Character System**: Create characters with avatars, names, and bios
- **Post Creation**: Write posts as your characters within story days
- **Day/Chapter System**: Organize story progression with day declarations
- **Real-time Collaboration**: Multiple users can contribute to the same story

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React
- **Image Storage**: Supabase Storage

## Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd featherink
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. Set up Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- users handled by Supabase Auth

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

-- Enable RLS
alter table stories enable row level security;
alter table story_participants enable row level security;
alter table characters enable row level security;
alter table story_days enable row level security;
alter table posts enable row level security;
alter table end_of_day_declarations enable row level security;

-- RLS Policies
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

create policy "read story_participants for participants"
on story_participants for select
using (user_id = auth.uid() or exists (select 1 from story_participants sp where sp.story_id = story_participants.story_id and sp.user_id = auth.uid()));

create policy "insert story_participants for authenticated"
on story_participants for insert to authenticated
with check (user_id = auth.uid());

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

create policy "read story_days for story participants"
on story_days for select
using (exists (select 1 from story_participants sp where sp.story_id = story_days.story_id and sp.user_id = auth.uid()));

create policy "insert story_days for story participants"
on story_days for insert to authenticated
with check (exists (select 1 from story_participants sp where sp.story_id = story_days.story_id and sp.user_id = auth.uid()));

create policy "update story_days for story participants"
on story_days for update
using (exists (select 1 from story_participants sp where sp.story_id = story_days.story_id and sp.user_id = auth.uid()));

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

create policy "read end_of_day_declarations for story participants"
on end_of_day_declarations for select
using (exists (select 1 from story_participants sp where sp.story_id = end_of_day_declarations.story_id and sp.user_id = auth.uid()));

create policy "insert end_of_day_declarations for story participants"
on end_of_day_declarations for insert to authenticated
with check (user_id = auth.uid() and exists (select 1 from story_participants sp where sp.story_id = end_of_day_declarations.story_id and sp.user_id = auth.uid()));
```

### 4. Set up Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `avatars`
3. Set the bucket to public

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. **Sign Up**: Create a new account or login
2. **Create Story**: Start a new collaborative story
3. **Create Characters**: Add characters to your story
4. **Write Posts**: Contribute to the story as your characters
5. **Manage Days**: Declare end of day and start new chapters

## Design System

The application uses the Featherink design system with:

- **Colors**: Magical Blue (#2800CA), Lavender (#CCEAF9), Paper (#F9F9FC), Ink Black (#2C2C30)
- **Typography**: Yantramanav (headings) and Vollkorn (body text)
- **Grid System**: Responsive grid for desktop (1152px), tablet (704px), and mobile (320px)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.