import { supabase } from './supabase'
import { Database } from './supabase'

type Character = Database['public']['Tables']['characters']['Row']
type CharacterInsert = Omit<Database['public']['Tables']['characters']['Insert'], 'user_id'>
type CharacterUpdate = Database['public']['Tables']['characters']['Update']

// Fetch all characters for a story
export async function fetchCharacters(storyId: string): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

// Fetch characters for the current user in a story
export async function fetchUserCharacters(storyId: string): Promise<Character[]> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('story_id', storyId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

// Create a new character
export async function createCharacter(character: CharacterInsert): Promise<Character> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('characters')
    .insert({
      ...character,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Update character details
export async function updateCharacter(characterId: string, updates: CharacterUpdate): Promise<Character> {
  const { data, error } = await supabase
    .from('characters')
    .update(updates)
    .eq('id', characterId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Delete a character
export async function deleteCharacter(characterId: string): Promise<void> {
  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('id', characterId)

  if (error) {
    throw error
  }
}

// Upload character avatar
export async function uploadCharacterAvatar(characterId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${characterId}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return data.publicUrl
}

// Get character by ID
export async function getCharacter(characterId: string): Promise<Character | null> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single()

  if (error) {
    return null
  }

  return data
}
