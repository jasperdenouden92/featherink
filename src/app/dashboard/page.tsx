'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { fetchStories, createStory } from '@/lib/storyActions'
import { StoryWithDetails } from '@/lib/storyActions'
import { StoryList } from '@/components/stories/StoryList'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar } from '@/components/ui/Avatar'

export default function DashboardPage() {
  const router = useRouter()
  const [stories, setStories] = useState<StoryWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newStoryTitle, setNewStoryTitle] = useState('')
  const [newStoryDescription, setNewStoryDescription] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    checkAuth()
    loadStories()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const loadStories = async () => {
    try {
      console.log('🔄 Starting to load stories...')
      const userStories = await fetchStories()
      console.log('✅ Stories loaded successfully:', userStories)
      setStories(userStories)
    } catch (error) {
      console.error('❌ Error loading stories:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error constructor:', error?.constructor?.name)
      console.error('❌ Error message:', error?.message)
      console.error('❌ Error stack:', error?.stack)
      console.error('❌ Full error object:', error)
      
      // Try to stringify the error
      try {
        console.error('❌ Error JSON:', JSON.stringify(error, null, 2))
      } catch (stringifyError) {
        console.error('❌ Could not stringify error:', stringifyError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newStoryTitle.trim()) return

    setCreating(true)
    try {
      const newStory = await createStory({
        title: newStoryTitle.trim(),
        description: newStoryDescription.trim() || null
      })
      
      setStories(prev => [...prev, newStory])
      setNewStoryTitle('')
      setNewStoryDescription('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('❌❌❌ ERROR IN handleCreateStory ❌❌❌')
      console.error('Error object:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      
      // Try to stringify the error
      try {
        console.error('Error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      } catch (stringifyError) {
        console.error('Could not stringify error:', stringifyError)
      }
      
      // Check if it's a Supabase error
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Supabase error code:', (error as any).code)
        console.error('Supabase error message:', (error as any).message)
        console.error('Supabase error hint:', (error as any).hint)
        console.error('Supabase error details:', (error as any).details)
      }
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error && typeof error === 'object' && 'message' in error)
        ? String((error as any).message)
        : 'Unknown error occurred'
      
      alert(`Failed to create story: ${errorMessage}`)
    } finally {
      setCreating(false)
    }
  }

  const handleStoryClick = (story: StoryWithDetails) => {
    router.push(`/story/${story.id}`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-1 text-ink-black mb-4">featherink</h1>
          <p className="paragraph-1 text-books-grey">Loading stories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="bg-white border-b border-iron-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="heading-3 text-ink-black">featherink</h1>
              <Button variant="secondary">New story</Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Avatar fallback="U" size="sm" />
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="heading-2 mb-2">Stories</h2>
        </div>

        {showCreateForm ? (
          <Card className="mb-8">
            <CardHeader>
              <h3 className="heading-3">Create New Story</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateStory} className="space-y-4">
                <Input
                  label="Story Title"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="Enter story title"
                  required
                />
                
                <Textarea
                  label="Description"
                  value={newStoryDescription}
                  onChange={(e) => setNewStoryDescription(e.target.value)}
                  placeholder="Describe your story..."
                  rows={3}
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={creating || !newStoryTitle.trim()}
                  >
                    {creating ? 'Creating...' : 'Create Story'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="mb-8">
            <Button onClick={() => setShowCreateForm(true)}>
              Create New Story
            </Button>
          </div>
        )}

        <StoryList stories={stories} onStoryClick={handleStoryClick} />
      </main>
    </div>
  )
}
