import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client with proper options for browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      stories: {
        Row: {
          id: string
          title: string
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      story_participants: {
        Row: {
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
        }
      }
      characters: {
        Row: {
          id: string
          story_id: string
          user_id: string
          name: string
          bio: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          name: string
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          name?: string
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      story_days: {
        Row: {
          id: string
          story_id: string
          day_number: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          day_number: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          day_number?: number
          is_active?: boolean
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          story_id: string
          day_id: string
          character_id: string | null
          title: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          day_id: string
          character_id?: string | null
          title?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          day_id?: string
          character_id?: string | null
          title?: string | null
          content?: string
          created_at?: string
        }
      }
      end_of_day_declarations: {
        Row: {
          id: string
          story_id: string
          day_id: string
          user_id: string
          declared_at: string
        }
        Insert: {
          id?: string
          story_id: string
          day_id: string
          user_id: string
          declared_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          day_id?: string
          user_id?: string
          declared_at?: string
        }
      }
    }
  }
}
