import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { StoryWithDetails } from '@/lib/storyActions'

interface StoryCardProps {
  story: StoryWithDetails
  onClick?: () => void
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Story Image Placeholder */}
        <div className="w-full h-48 bg-gradient-to-br from-magical-blue to-lavender rounded-t-lg flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-4xl mb-2">📖</div>
            <div className="text-sm opacity-80">Story Image</div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="heading-3 mb-2">{story.title}</h3>
          {story.description && (
            <p className="paragraph-1 text-books-grey mb-4 line-clamp-2">
              {story.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-micro-text text-pencils-grey">
            <span>
              Latest post: {story.active_day ? `Day ${story.active_day.day_number}` : 'No posts yet'}
            </span>
            <span>
              {story.participants.length} participant{story.participants.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
