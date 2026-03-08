'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar } from '@/components/ui/Avatar'
import { createPost } from '@/lib/postActions'
import { fetchUserCharacters } from '@/lib/characterActions'
import { Character } from '@/lib/supabase'

interface PostComposerProps {
  storyId: string
  dayId: string
  onPostCreated?: () => void
}

export function PostComposer({ storyId, dayId, onPostCreated }: PostComposerProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedCharacterId, setSelectedCharacterId] = useState('')
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(false)
  const [showComposer, setShowComposer] = useState(false)

  useEffect(() => {
    loadCharacters()
  }, [storyId])

  const loadCharacters = async () => {
    try {
      const userCharacters = await fetchUserCharacters(storyId)
      setCharacters(userCharacters)
      if (userCharacters.length > 0) {
        setSelectedCharacterId(userCharacters[0].id)
      }
    } catch (error) {
      console.error('Error loading characters:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || !selectedCharacterId) {
      return
    }

    setLoading(true)
    try {
      await createPost({
        story_id: storyId,
        day_id: dayId,
        character_id: selectedCharacterId,
        title: title.trim() || null,
        content: content.trim()
      })

      // Reset form
      setTitle('')
      setContent('')
      setShowComposer(false)
      
      onPostCreated?.()
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId)

  if (!showComposer) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <button
            onClick={() => setShowComposer(true)}
            className="w-full text-left p-4 border-2 border-dashed border-iron-grey rounded-lg hover:border-magical-blue transition-colors"
          >
            <div className="text-center text-pencils-grey">
              Add more to the story...
            </div>
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar
              src={selectedCharacter?.avatar_url || undefined}
              fallback={selectedCharacter?.name?.[0] || '?'}
              size="sm"
            />
            
            <div className="flex-1">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title (optional)"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Select a character</label>
            <select
              value={selectedCharacterId}
              onChange={(e) => setSelectedCharacterId(e.target.value)}
              className="form-input w-full"
              required
            >
              {characters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            label="Your story"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Once upon a time..."
            required
            rows={6}
          />

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading || !content.trim() || !selectedCharacterId}
            >
              {loading ? 'Publishing...' : 'Publish'}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowComposer(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
