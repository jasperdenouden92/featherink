import { supabase } from './supabase'
import { Database } from './supabase'

type Story = Database['public']['Tables']['stories']['Row']
type StoryInsert = Database['public']['Tables']['stories']['Insert']
type StoryUpdate = Database['public']['Tables']['stories']['Update']

type StoryParticipant = Database['public']['Tables']['story_participants']['Row']
type StoryParticipantInsert = Database['public']['Tables']['story_participants']['Insert']

type StoryDay = Database['public']['Tables']['story_days']['Row']
type StoryDayInsert = Database['public']['Tables']['story_days']['Insert']
type StoryDayUpdate = Database['public']['Tables']['story_days']['Update']

export interface StoryWithDetails extends Story {
  participants: StoryParticipant[]
  active_day: StoryDay | null
  day_count: number
}

// Fetch all stories for the current user
export async function fetchStories(): Promise<StoryWithDetails[]> {
  console.log('🔍 fetchStories function called')
  
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('👤 Current user:', user)
  
  if (!user) {
    console.log('❌ No user found, throwing error')
    throw new Error('User not authenticated')
  }

  console.log('✅ User authenticated, fetching stories for user:', user.id)

  const { data: stories, error } = await supabase
    .from('stories')
    .select(`
      *,
      story_participants!inner(*),
      story_days(*)
    `)
    .eq('story_participants.user_id', user.id)

  console.log('📊 Stories query result:', { stories, error })

  if (error) {
    console.log('❌ Database error:', error)
    throw error
  }

  console.log('✅ Query successful, transforming data...')

  // Transform the data to match our interface
  const storiesWithDetails: StoryWithDetails[] = stories.map(story => ({
    ...story,
    participants: story.story_participants || [],
    active_day: story.story_days?.find(day => day.is_active) || null,
    day_count: story.story_days?.length || 0
  }))

  console.log('✅ Transformed stories:', storiesWithDetails)

  return storiesWithDetails
}

// Create a new story
export async function createStory(story: StoryInsert): Promise<Story> {
  console.log('🚀 Starting createStory with:', story)
  
  // Verify Supabase client is initialized
  if (!supabase) {
    console.error('❌ Supabase client is not initialized!')
    throw new Error('Database connection not available')
  }
  
  console.log('✅ Supabase client initialized')
  console.log('🔍 Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  // Check session first
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  console.log('🔐 Session check:', { 
    hasSession: !!session,
    userId: session?.user?.id,
    userEmail: session?.user?.email,
    sessionError: sessionError ? JSON.stringify(sessionError, null, 2) : null
  })
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('👤 User check:', { 
    userId: user?.id, 
    userEmail: user?.email,
    userError: userError ? JSON.stringify(userError, null, 2) : null
  })
  
  if (!user) {
    console.error('❌ No user found')
    throw new Error('User not authenticated')
  }

  console.log('📝 Step 1: Inserting story...')
  
  // Verify session is available
  const { data: { session: currentSession } } = await supabase.auth.getSession()
  console.log('🔐 Current session for insert:', {
    hasSession: !!currentSession,
    userId: currentSession?.user?.id,
    accessToken: currentSession?.access_token ? 'present (' + currentSession.access_token.substring(0, 20) + '...)' : 'missing',
    expiresAt: currentSession?.expires_at,
    tokenType: currentSession?.token_type
  })
  
  // Also check if we can get the user directly
  const { data: { user: directUser }, error: directUserError } = await supabase.auth.getUser()
  console.log('👤 Direct user check:', {
    userId: directUser?.id,
    email: directUser?.email,
    error: directUserError
  })
  
  const storyData = {
    ...story,
    created_by: user.id
  }
  console.log('📝 Story data to insert:', storyData)
  console.log('📝 User ID from auth:', user.id)
  console.log('📝 Created_by value:', storyData.created_by)
  console.log('📝 Values match?', user.id === storyData.created_by)
  
  // Ensure we have a fresh session before making the request
  const { data: { session: insertSession } } = await supabase.auth.getSession()
  if (!insertSession?.access_token) {
    console.error('❌ No access token in session!')
    throw new Error('Authentication session expired. Please log in again.')
  }
  
  console.log('🔑 Access token present:', insertSession.access_token.substring(0, 20) + '...')
  
  // Try the insert - Supabase client should automatically include the JWT token
  const { data, error: storyError } = await supabase
    .from('stories')
    .insert(storyData)
    .select()
    .single()

  console.log('📝 Story insert result:', { data, error: storyError })
  
  // If error, log full details
  if (storyError) {
    console.error('📝 Full error object:', storyError)
    console.error('📝 Error code:', storyError.code)
    console.error('📝 Error message:', storyError.message)
    console.error('📝 Error hint:', storyError.hint)
    console.error('📝 Error details:', storyError.details)
  }
  
  if (storyError) {
    console.error('❌ Error inserting story:', storyError)
    console.error('❌ Story error details:', JSON.stringify(storyError, null, 2))
    throw storyError
  }

  if (!data) {
    console.error('❌ No data returned from story insert')
    throw new Error('Failed to create story: no data returned')
  }

  console.log('✅ Story created with ID:', data.id)

  console.log('👥 Step 2: Adding creator as participant...')
  const participantData = {
    story_id: data.id,
    user_id: user.id
  }
  console.log('👥 Participant data to insert:', participantData)
  
  const { data: participantDataResult, error: participantError } = await supabase
    .from('story_participants')
    .insert(participantData)
    .select()

  console.log('👥 Participant insert result:', { data: participantDataResult, error: participantError })
  
  if (participantError) {
    console.error('❌ Error inserting participant:', participantError)
    console.error('❌ Participant error details:', JSON.stringify(participantError, null, 2))
    // Try to clean up the story if participant insert fails
    const { error: deleteError } = await supabase.from('stories').delete().eq('id', data.id)
    console.log('🧹 Cleanup result:', deleteError)
    throw participantError
  }

  console.log('✅ Participant added')

  console.log('📅 Step 3: Creating first day...')
  const dayData = {
    story_id: data.id,
    day_number: 1,
    is_active: true
  }
  console.log('📅 Day data to insert:', dayData)
  
  const { data: dayDataResult, error: dayError } = await supabase
    .from('story_days')
    .insert(dayData)
    .select()

  console.log('📅 Day insert result:', { data: dayDataResult, error: dayError })
  
  if (dayError) {
    console.error('❌ Error inserting story day:', dayError)
    console.error('❌ Day error details:', JSON.stringify(dayError, null, 2))
    console.error('❌ Day error code:', dayError.code)
    console.error('❌ Day error message:', dayError.message)
    console.error('❌ Day error hint:', dayError.hint)
    console.error('❌ Day error details:', dayError.details)
    // Try to clean up if day insert fails
    const { error: deleteParticipantError } = await supabase.from('story_participants').delete().eq('story_id', data.id)
    const { error: deleteStoryError } = await supabase.from('stories').delete().eq('id', data.id)
    console.log('🧹 Cleanup results:', { deleteParticipantError, deleteStoryError })
    throw dayError
  }

  console.log('✅ Day created')
  console.log('🎉 Story creation complete!')
  
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
