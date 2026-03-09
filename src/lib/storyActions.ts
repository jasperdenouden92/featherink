import { supabase } from './supabase'
import { Database } from './supabase'

type Story = Database['public']['Tables']['stories']['Row']
type StoryInsert = Database['public']['Tables']['stories']['Insert']
type StoryUpdate = Database['public']['Tables']['stories']['Update']

type StoryParticipant = Database['public']['Tables']['story_participants']['Row']

type StoryDay = Database['public']['Tables']['story_days']['Row']

export interface StoryWithDetails extends Story {
  participants: StoryParticipant[]
  active_day: StoryDay | null
  day_count: number
}

// Fetch all stories for the current user
export async function fetchStories(): Promise<StoryWithDetails[]> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      *,
      story_participants!inner(*),
      story_days(*)
    `)
    .eq('story_participants.user_id', user.id)

  if (error) {
    throw error
  }

  const storiesWithDetails: StoryWithDetails[] = (stories || []).map((story: any) => ({
    ...story,
    participants: story.story_participants || [],
    active_day: story.story_days?.find((day: StoryDay) => day.is_active) || null,
    day_count: story.story_days?.length || 0
  }))

  return storiesWithDetails
}

// Fetch a single story by ID
export async function fetchStory(storyId: string): Promise<StoryWithDetails | null> {
  const { data: story, error } = await supabase
    .from('stories')
    .select(`
      *,
      story_participants(*),
      story_days(*)
    `)
    .eq('id', storyId)
    .single()

  if (error) {
    return null
  }

  return {
    ...story,
    participants: (story as any).story_participants || [],
    active_day: (story as any).story_days?.find((day: StoryDay) => day.is_active) || null,
    day_count: (story as any).story_days?.length || 0
  }
}

// Create a new story
export async function createStory(story: StoryInsert): Promise<Story> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error: storyError } = await supabase
    .from('stories')
    .insert({
      ...story,
      created_by: user.id
    })
    .select()
    .single()

  if (storyError) {
    throw storyError
  }

  if (!data) {
    throw new Error('Failed to create story: no data returned')
  }

  // Add creator as participant
  const { error: participantError } = await supabase
    .from('story_participants')
    .insert({
      story_id: data.id,
      user_id: user.id
    })

  if (participantError) {
    await supabase.from('stories').delete().eq('id', data.id)
    throw participantError
  }

  // Create first day
  const { error: dayError } = await supabase
    .from('story_days')
    .insert({
      story_id: data.id,
      day_number: 1,
      is_active: true
    })

  if (dayError) {
    await supabase.from('story_participants').delete().eq('story_id', data.id)
    await supabase.from('stories').delete().eq('id', data.id)
    throw dayError
  }

  return data
}

// Join a story (add user as participant)
export async function joinStory(storyId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('story_participants')
    .insert({
      story_id: storyId,
      user_id: user.id
    })

  if (error) {
    throw error
  }
}

// Update story details
export async function updateStory(storyId: string, updates: StoryUpdate): Promise<Story> {
  const { data, error } = await supabase
    .from('stories')
    .update(updates)
    .eq('id', storyId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Delete a story
export async function deleteStory(storyId: string): Promise<void> {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId)

  if (error) {
    throw error
  }
}

// Get story participants
export async function getStoryParticipants(storyId: string): Promise<StoryParticipant[]> {
  const { data, error } = await supabase
    .from('story_participants')
    .select('*')
    .eq('story_id', storyId)

  if (error) {
    throw error
  }

  return data || []
}

// Check if user is a participant in a story
export async function isStoryParticipant(storyId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data, error } = await supabase
    .from('story_participants')
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return false
  }

  return !!data
}
