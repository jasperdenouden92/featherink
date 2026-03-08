'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { fetchCharacters, createCharacter, updateCharacter, deleteCharacter } from '@/lib/characterActions'
import { isStoryParticipant } from '@/lib/storyActions'
import { Character } from '@/lib/supabase'
import { CharacterCard } from '@/components/characters/CharacterCard'
import { CharacterForm } from '@/components/characters/CharacterForm'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'

export default function CharactersPage() {
  const router = useRouter()
  const params = useParams()
  const storyId = params.id as string

  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [isParticipant, setIsParticipant] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (storyId) {
      loadData()
    }
  }, [storyId])

  const loadData = async () => {
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

      // Load characters
      const storyCharacters = await fetchCharacters(storyId)
      setCharacters(storyCharacters)
    } catch (error) {
      console.error('Error loading characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCharacter = async (character: Character) => {
    setCharacters(prev => [...prev, character])
    setShowCreateForm(false)
  }

  const handleUpdateCharacter = async (updatedCharacter: Character) => {
    setCharacters(prev => 
      prev.map(c => c.id === updatedCharacter.id ? updatedCharacter : c)
    )
    setEditingCharacter(null)
  }

  const handleDeleteCharacter = async (character: Character) => {
    if (confirm(`Are you sure you want to delete ${character.name}?`)) {
      try {
        await deleteCharacter(character.id)
        setCharacters(prev => prev.filter(c => c.id !== character.id))
      } catch (error) {
        console.error('Error deleting character:', error)
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (character.bio && character.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-1 text-ink-black mb-4">featherink</h1>
          <p className="paragraph-1 text-books-grey">Loading characters...</p>
        </div>
      </div>
    )
  }

  if (!isParticipant) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-1 text-ink-black mb-4">Access denied</h1>
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
              <h1 className="heading-3 text-ink-black">Characters</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="secondary"
                onClick={() => setShowCreateForm(true)}
              >
                New character
              </Button>
              <Avatar fallback="U" size="sm" />
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search for characters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="secondary">Search</Button>
          </div>
        </div>

        {/* Character Form */}
        {(showCreateForm || editingCharacter) && (
          <div className="mb-8">
            <CharacterForm
              storyId={storyId}
              character={editingCharacter || undefined}
              onSave={editingCharacter ? handleUpdateCharacter : handleCreateCharacter}
              onCancel={() => {
                setShowCreateForm(false)
                setEditingCharacter(null)
              }}
            />
          </div>
        )}

        {/* Characters Grid */}
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="heading-2 mb-2">No characters found</h2>
            <p className="paragraph-1 text-books-grey mb-6">
              {searchTerm ? 'No characters match your search.' : 'Create your first character to get started.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                Create Character
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onEdit={setEditingCharacter}
                onDelete={handleDeleteCharacter}
                canEdit={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
