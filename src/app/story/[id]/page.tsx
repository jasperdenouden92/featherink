'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PostWithCharacter, StoryDay } from '@/lib/supabase'
import { fetchStory, isStoryParticipant } from '@/lib/storyActions'
import { fetchPosts, getActiveDay } from '@/lib/postActions'
import { StoryWithDetails } from '@/lib/storyActions'
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
  const [selectedDay, setSelectedDay] = useState<StoryDay | null>(null)
  const [loading, setLoading] = useState(true)
  const [isParticipant, setIsParticipant] = useState(false)

  useEffect(() => {
    if (storyId) {
      loadStoryData()
    }
  }, [storyId])

  const loadStoryData = async () => {
    try {
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

      const currentStory = await fetchStory(storyId)
      if (!currentStory) {
        router.push('/dashboard')
        return
      }

      setStory(currentStory)

      const day = await getActiveDay(storyId)
      if (day) {
        setActiveDay(day)
        setSelectedDay(day)
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
    setSelectedDay(day)
    try {
      const dayPosts = await fetchPosts(storyId, day.id)
      setPosts(dayPosts)
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  const handlePostCreated = () => {
    loadStoryData()
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

  const viewingDay = selectedDay || activeDay

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="bg-white border-b border-iron-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="heading-3 text-ink-black hover:text-magical-blue transition-colors"
              >
                featherink
              </button>
              <span className="text-iron-grey">/</span>
              <h1 className="heading-3 text-ink-black">{story.title}</h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => router.push(`/story/${storyId}/characters`)}
              >
                Characters
              </Button>
              <Avatar fallback="U" size="sm" />
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Story ID for sharing */}
      <div className="bg-lavender/30 border-b border-iron-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2 text-sm text-books-grey">
          <span>Story ID:</span>
          <code className="bg-white px-2 py-0.5 rounded text-ink-black font-mono text-xs select-all">
            {storyId}
          </code>
          <span className="text-pencils-grey">- Share this with others so they can join</span>
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
            {viewingDay && (
              <>
                <div className="mb-6">
                  <h2 className="heading-2">DAY {viewingDay.day_number}</h2>
                </div>

                {/* Posts */}
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      canEdit={true}
                      onDelete={async (p) => {
                        const { deletePost } = await import('@/lib/postActions')
                        await deletePost(p.id)
                        handlePostCreated()
                      }}
                    />
                  ))}
                </div>

                {posts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="paragraph-1 text-books-grey">
                      No posts on this day yet. Be the first to write!
                    </p>
                  </div>
                )}

                {/* Post Composer - only on active day */}
                {viewingDay.is_active && (
                  <PostComposer
                    storyId={storyId}
                    dayId={viewingDay.id}
                    onPostCreated={handlePostCreated}
                  />
                )}
              </>
            )}

            {!viewingDay && (
              <div className="text-center py-12">
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
