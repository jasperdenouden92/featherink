import React from 'react'
import { StoryCard } from './StoryCard'
import { StoryWithDetails } from '@/lib/storyActions'

interface StoryListProps {
  stories: StoryWithDetails[]
  onStoryClick?: (story: StoryWithDetails) => void
}

export function StoryList({ stories, onStoryClick }: StoryListProps) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="heading-2 mb-2">No stories yet</h2>
        <p className="paragraph-1 text-books-grey mb-6">
          Create your first collaborative story or join an existing one.
        </p>
        <button className="btn-primary">
          Create New Story
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          onClick={() => onStoryClick?.(story)}
        />
      ))}
    </div>
  )
}
