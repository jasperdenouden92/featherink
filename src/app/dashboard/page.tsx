'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { fetchStories, createStory, joinStory } from '@/lib/storyActions'
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
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [newStoryTitle, setNewStoryTitle] = useState('')
  const [newStoryDescription, setNewStoryDescription] = useState('')
  const [joinStoryId, setJoinStoryId] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      const userStories = await fetchStories()
      setStories(userStories)
    } catch (err) {
      console.error('Error loading stories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStoryTitle.trim()) return

    setCreating(true)
    setError(null)
    try {
      await createStory({
        title: newStoryTitle.trim(),
        description: newStoryDescription.trim() || null
      })

      setNewStoryTitle('')
      setNewStoryDescription('')
      setShowCreateForm(false)
      await loadStories()
    } catch (err: any) {
      const message = err?.message || (typeof err === 'string' ? err : 'Failed to create story')
      setError(message)
      console.error('Create story error:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleJoinStory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinStoryId.trim()) return

    setJoining(true)
    setError(null)
    try {
      await joinStory(joinStoryId.trim())
      setJoinStoryId('')
      setShowJoinForm(false)
      await loadStories()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join story'
      setError(message)
    } finally {
      setJoining(false)
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
        <div className="mb-8 flex items-center justify-between">
          <h2 className="heading-2">Stories</h2>
          <div className="flex gap-3">
            <Button onClick={() => { setShowCreateForm(true); setShowJoinForm(false) }}>
              Create Story
            </Button>
            <Button variant="secondary" onClick={() => { setShowJoinForm(true); setShowCreateForm(false) }}>
              Join Story
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-blood-red rounded-lg text-blood-red">
            {error}
          </div>
        )}

        {showCreateForm && (
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
        )}

        {showJoinForm && (
          <Card className="mb-8">
            <CardHeader>
              <h3 className="heading-3">Join a Story</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinStory} className="space-y-4">
                <Input
                  label="Story ID"
                  value={joinStoryId}
                  onChange={(e) => setJoinStoryId(e.target.value)}
                  placeholder="Paste the story ID to join"
                  required
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={joining || !joinStoryId.trim()}
                  >
                    {joining ? 'Joining...' : 'Join Story'}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowJoinForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <StoryList stories={stories} onStoryClick={handleStoryClick} />
      </main>
    </div>
  )
}
