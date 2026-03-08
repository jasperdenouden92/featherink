'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar } from '@/components/ui/Avatar'
import { createCharacter, updateCharacter, uploadCharacterAvatar } from '@/lib/characterActions'
import { Character } from '@/lib/supabase'

interface CharacterFormProps {
  storyId: string
  character?: Character
  onSave?: (character: Character) => void
  onCancel?: () => void
}

export function CharacterForm({ storyId, character, onSave, onCancel }: CharacterFormProps) {
  const [name, setName] = useState(character?.name || '')
  const [bio, setBio] = useState(character?.bio || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(character?.avatar_url || null)
  const [loading, setLoading] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      return
    }

    setLoading(true)
    try {
      let avatarUrl = character?.avatar_url || null

      // Upload avatar if a new file was selected
      if (avatarFile) {
        avatarUrl = await uploadCharacterAvatar(character?.id || 'temp', avatarFile)
      }

      const characterData = {
        story_id: storyId,
        name: name.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl
      }

      let savedCharacter: Character
      if (character) {
        savedCharacter = await updateCharacter(character.id, characterData)
      } else {
        savedCharacter = await createCharacter(characterData)
      }

      onSave?.(savedCharacter)
    } catch (error) {
      console.error('Error saving character:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="heading-3">
          {character ? 'Edit Character' : 'Create New Character'}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <Avatar
              src={avatarPreview || undefined}
              fallback={name[0] || '?'}
              size="lg"
            />
            
            <div>
              <label className="form-label">Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="form-input"
              />
              <p className="text-micro-text text-pencils-grey mt-1">
                Upload an image for your character
              </p>
            </div>
          </div>

          {/* Character Name */}
          <Input
            label="Character Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter character name"
            required
          />

          {/* Character Bio */}
          <Textarea
            label="Character Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe your character's background, personality, and role in the story..."
            rows={4}
          />

          {/* Form Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Saving...' : (character ? 'Update Character' : 'Create Character')}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
