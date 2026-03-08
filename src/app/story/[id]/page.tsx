'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { fetchStories, isStoryParticipant } from '@/lib/storyActions'
import { fetchPosts, getActiveDay } from '@/lib/postActions'
import { StoryWithDetails } from '@/lib/storyActions'
import { PostWithCharacter, StoryDay } from '@/lib/supabase'
import { StorySidebar } from '@/components/stories/StorySidebar'
import { PostCard } from '@/components/stories/PostCard'
import { PostComposer } from '@/components/stories/PostComposer'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'

export default function StoryPage() {
  const router = useRouter()
  const params = useParams()
  const storyId = params.id as string

  const [story, setStory] = useState<StoryWithDetails | null>(null)
  const [posts, setPosts] = useState<PostWithCharacter[]>([])
  const [activeDay, setActiveDay] = useState<StoryDay | null>(null)
  const [loading, setLoading] = useState(true)
  const [isParticipant, setIsParticipant] = useState(false)

  useEffect(() => {
    if (storyId) {
      loadStoryData()
    }
  }, [storyId])

  const loadStoryData = async () => {
    try {
      // Check if user is authenticated and a participant
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const participant = await isStoryParticipant(storyId)
      if (!participant) {
        router.push('/dashboard')
        return
      }

      setIsParticipant(true)

      // Load story details
      const stories = await fetchStories()
      const currentStory = stories.find(s => s.id === storyId)
      if (!currentStory) {
        router.push('/dashboard')
        return
      }

      setStory(currentStory)

      // Load active day and posts
      const day = await getActiveDay(storyId)
      if (day) {
        setActiveDay(day)
        const dayPosts = await fetchPosts(storyId, day.id)
        setPosts(dayPosts)
      }
    } catch (error) {
      console.error('Error loading story data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDayChange = async (day: StoryDay) => {
    setActiveDay(day)
    try {
      const dayPosts = await fetchPosts(storyId, day.id)
      setPosts(dayPosts)
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  const handlePostCreated = () => {
    loadStoryData() // Reload to get updated posts
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
          <p className="paragraph-1 text-books-grey">Loading story...</p>
        </div>
      </div>
    )
  }

  if (!story || !isParticipant) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-1 text-ink-black mb-4">Story not found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
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
              <h1 className="heading-3 text-ink-black">{story.title}</h1>
              <div className="flex gap-2">
                <Button variant="secondary">Story</Button>
                <Button variant="secondary">Characters</Button>
                <Button variant="secondary">Settings</Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="secondary">New post</Button>
              <Avatar fallback="U" size="sm" />
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-magical-blue to-lavender py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="heading-1 text-white mb-4">{story.title}</h1>
          {story.description && (
            <p className="subtitle-1 text-white opacity-90">{story.description}</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <StorySidebar 
            storyId={storyId} 
            onDayChange={handleDayChange}
          />

          {/* Main Content Area */}
          <div className="flex-1">
            {activeDay && (
              <>
                <div className="mb-6">
                  <h2 className="heading-2">DAY {activeDay.day_number}</h2>
                </div>

                {/* Posts */}
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      canEdit={true}
                    />
                  ))}
                </div>

                {/* Post Composer */}
                {activeDay.is_active && (
                  <PostComposer
                    storyId={storyId}
                    dayId={activeDay.id}
                    onPostCreated={handlePostCreated}
                  />
                )}
              </>
            )}

            {!activeDay && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📖</div>
                <h2 className="heading-2 mb-2">No active day</h2>
                <p className="paragraph-1 text-books-grey">
                  This story doesn't have an active day yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
