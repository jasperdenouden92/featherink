'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { PostWithCharacter } from '@/lib/postActions'
import { supabase } from '@/lib/supabase'

interface PostCardProps {
  post: PostWithCharacter
  onEdit?: (post: PostWithCharacter) => void
  onDelete?: (post: PostWithCharacter) => void
  canEdit?: boolean
}

export function PostCard({ post, onEdit, onDelete, canEdit = false }: PostCardProps) {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const checkOwnership = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsOwner(user?.id === post.character?.user_id)
    }
    checkOwnership()
  }, [post.character?.user_id])

  const canEditPost = canEdit && isOwner

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar
            src={post.character?.avatar_url || undefined}
            fallback={post.character?.name?.[0] || '?'}
            size="md"
          />
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                {post.title && (
                  <h4 className="heading-4 mb-1">{post.title}</h4>
                )}
                <div className="flex items-center gap-2 text-micro-text text-pencils-grey">
                  <span>{post.character?.name || 'Anonymous'}</span>
                  <span>•</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
              
              {canEditPost && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => onEdit?.(post)}
                    className="text-sm px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onDelete?.(post)}
                    className="text-sm px-3 py-1 text-blood-red hover:text-blood-red"
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
            
            <div className="paragraph-1 whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
