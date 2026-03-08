'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { 
  getStoryDays, 
  getActiveDay, 
  declareEndOfDay, 
  hasUserDeclaredEndOfDay,
  canStartNewDay,
  startNewDay,
  getEndOfDayDeclarations
} from '@/lib/postActions'
import { StoryDay } from '@/lib/supabase'

interface StorySidebarProps {
  storyId: string
  onDayChange?: (day: StoryDay) => void
}

export function StorySidebar({ storyId, onDayChange }: StorySidebarProps) {
  const [days, setDays] = useState<StoryDay[]>([])
  const [activeDay, setActiveDay] = useState<StoryDay | null>(null)
  const [userHasDeclared, setUserHasDeclared] = useState(false)
  const [canStart, setCanStart] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [storyId])

  const loadData = async () => {
    try {
      const [daysData, activeDayData] = await Promise.all([
        getStoryDays(storyId),
        getActiveDay(storyId)
      ])
      
      setDays(daysData)
      setActiveDay(activeDayData)

      if (activeDayData) {
        const [hasDeclared, canStartNew] = await Promise.all([
          hasUserDeclaredEndOfDay(activeDayData.id),
          canStartNewDay(storyId, activeDayData.id)
        ])
        
        setUserHasDeclared(hasDeclared)
        setCanStart(canStartNew)
      }
    } catch (error) {
      console.error('Error loading sidebar data:', error)
    }
  }

  const handleDeclareEndOfDay = async () => {
    if (!activeDay) return
    
    setLoading(true)
    try {
      await declareEndOfDay(storyId, activeDay.id)
      setUserHasDeclared(true)
      
      // Check if we can start a new day now
      const canStartNew = await canStartNewDay(storyId, activeDay.id)
      setCanStart(canStartNew)
    } catch (error) {
      console.error('Error declaring end of day:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartNewDay = async () => {
    setLoading(true)
    try {
      const newDay = await startNewDay(storyId)
      setActiveDay(newDay)
      setDays(prev => [...prev, newDay])
      setUserHasDeclared(false)
      setCanStart(false)
      onDayChange?.(newDay)
    } catch (error) {
      console.error('Error starting new day:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDayClick = (day: StoryDay) => {
    onDayChange?.(day)
  }

  return (
    <div className="w-80 space-y-6">
      {/* Chapters */}
      <Card>
        <CardContent className="p-6">
          <h3 className="heading-4 mb-4">CHAPTERS</h3>
          <div className="space-y-2">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => handleDayClick(day)}
                className={`w-full text-left p-2 rounded transition-colors ${
                  day.id === activeDay?.id
                    ? 'bg-magical-blue text-white'
                    : 'hover:bg-marble-grey'
                }`}
              >
                Day {day.day_number}
                {!day.is_active && (
                  <span className="ml-2 text-xs opacity-75">(Locked)</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reading Order */}
      <Card>
        <CardContent className="p-6">
          <h3 className="heading-4 mb-4">READING ORDER</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-2 rounded bg-magical-blue text-white">
              New posts first
            </button>
            <button className="w-full text-left p-2 rounded hover:bg-marble-grey">
              Old posts first
            </button>
          </div>
        </CardContent>
      </Card>

      {/* End of Day Declaration */}
      {activeDay && (
        <Card>
          <CardContent className="p-6">
            <h3 className="heading-4 mb-4">DECLARE END OF DAY</h3>
            
            {userHasDeclared ? (
              <div className="text-center">
                <div className="text-forest-green mb-2">✓</div>
                <p className="paragraph-1 text-forest-green mb-4">
                  You have declared end of day
                </p>
                {canStart && (
                  <Button
                    onClick={handleStartNewDay}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Starting...' : 'Start New Day'}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Button
                  onClick={handleDeclareEndOfDay}
                  disabled={loading}
                  variant="ghost"
                  className="w-full"
                >
                  {loading ? 'Declaring...' : 'Declare End of Day'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
