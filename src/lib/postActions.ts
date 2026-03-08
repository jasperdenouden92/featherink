import { supabase } from './supabase'
import { Database } from './supabase'

type Post = Database['public']['Tables']['posts']['Row']
type PostInsert = Database['public']['Tables']['posts']['Insert']
type PostUpdate = Database['public']['Tables']['posts']['Update']

type StoryDay = Database['public']['Tables']['story_days']['Row']
type EndOfDayDeclaration = Database['public']['Tables']['end_of_day_declarations']['Row']

export interface PostWithCharacter extends Post {
  character: {
    id: string
    name: string
    avatar_url: string | null
    user_id: string
  } | null
}

// Fetch posts for a specific story and day
export async function fetchPosts(storyId: string, dayId: string): Promise<PostWithCharacter[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      character:characters(id, name, avatar_url, user_id)
    `)
    .eq('story_id', storyId)
    .eq('day_id', dayId)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

// Create a new post
export async function createPost(post: PostInsert): Promise<Post> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Verify the character belongs to the user
  if (post.character_id) {
    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('user_id')
      .eq('id', post.character_id)
      .single()

    if (charError || character?.user_id !== user.id) {
      throw new Error('Character not found or does not belong to user')
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Update a post
export async function updatePost(postId: string, updates: PostUpdate): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Delete a post
export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) {
    throw error
  }
}

// Get active day for a story
export async function getActiveDay(storyId: string): Promise<StoryDay | null> {
  const { data, error } = await supabase
    .from('story_days')
    .select('*')
    .eq('story_id', storyId)
    .eq('is_active', true)
    .single()

  if (error) {
    return null
  }

  return data
}

// Get all days for a story
export async function getStoryDays(storyId: string): Promise<StoryDay[]> {
  const { data, error } = await supabase
    .from('story_days')
    .select('*')
    .eq('story_id', storyId)
    .order('day_number', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

// Declare end of day
export async function declareEndOfDay(storyId: string, dayId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('end_of_day_declarations')
    .insert({
      story_id: storyId,
      day_id: dayId,
      user_id: user.id
    })

  if (error) {
    throw error
  }
}

// Check if user has declared end of day
export async function hasUserDeclaredEndOfDay(dayId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return false
  }

  const { data, error } = await supabase
    .from('end_of_day_declarations')
    .select('id')
    .eq('day_id', dayId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return false
  }

  return !!data
}

// Get end of day declarations for a day
export async function getEndOfDayDeclarations(dayId: string): Promise<EndOfDayDeclaration[]> {
  const { data, error } = await supabase
    .from('end_of_day_declarations')
    .select('*')
    .eq('day_id', dayId)

  if (error) {
    throw error
  }

  return data || []
}

// Check if all participants have declared end of day
export async function canStartNewDay(storyId: string, dayId: string): Promise<boolean> {
  // Get all participants
  const { data: participants, error: participantsError } = await supabase
    .from('story_participants')
    .select('user_id')
    .eq('story_id', storyId)

  if (participantsError) {
    throw participantsError
  }

  // Get all declarations for this day
  const { data: declarations, error: declarationsError } = await supabase
    .from('end_of_day_declarations')
    .select('user_id')
    .eq('day_id', dayId)

  if (declarationsError) {
    throw declarationsError
  }

  const participantIds = participants?.map(p => p.user_id) || []
  const declaredUserIds = declarations?.map(d => d.user_id) || []

  // Check if all participants have declared
  return participantIds.every(id => declaredUserIds.includes(id))
}

// Start a new day
export async function startNewDay(storyId: string): Promise<StoryDay> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Get current active day
  const activeDay = await getActiveDay(storyId)
  if (!activeDay) {
    throw new Error('No active day found')
  }

  // Check if all participants have declared end of day
  const canStart = await canStartNewDay(storyId, activeDay.id)
  if (!canStart) {
    throw new Error('Not all participants have declared end of day')
  }

  // Deactivate current day
  await supabase
    .from('story_days')
    .update({ is_active: false })
    .eq('id', activeDay.id)

  // Create new day
  const { data: newDay, error } = await supabase
    .from('story_days')
    .insert({
      story_id: storyId,
      day_number: activeDay.day_number + 1,
      is_active: true
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return newDay
}
