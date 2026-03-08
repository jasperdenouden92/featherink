import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Character } from '@/lib/supabase'

interface CharacterCardProps {
  character: Character
  onEdit?: (character: Character) => void
  onDelete?: (character: Character) => void
  canEdit?: boolean
}

export function CharacterCard({ character, onEdit, onDelete, canEdit = false }: CharacterCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar
            src={character.avatar_url || undefined}
            fallback={character.name[0]}
            size="lg"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="heading-4">{character.name}</h3>
              
              {canEdit && (
                <Button
                  variant="ghost"
                  onClick={() => onEdit?.(character)}
                  className="text-sm px-3 py-1"
                >
                  Edit
                </Button>
              )}
            </div>
            
            {character.bio && (
              <p className="paragraph-1 text-books-grey">
                {character.bio}
              </p>
            )}
            
            <div className="mt-4 text-micro-text text-pencils-grey">
              Created {new Date(character.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
