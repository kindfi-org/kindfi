'use client'

import React, { useState, useEffect } from 'react'
import { useProgressTracker } from '~/hooks/blockchain/use-progress-tracker'
import { useBadgeTracker } from '~/hooks/blockchain/use-badge-tracker'
import { ErrorDisplay } from '~/lib/clients/blockchain/docs/error-display'
import { CheckCircleIcon, PlayIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'

/**
 * Lesson Progress Card - Demonstrates integration of progress tracking with badge minting
 * 
 * Features:
 * - Real-time progress updates
 * - Automatic badge minting on chapter completion
 * - Error handling with user-friendly messages
 * - Optimistic UI updates
 * - Event-driven badge notifications
 * 
 * @example
 * ```tsx
 * <LessonProgressCard
 *   userId="GUSER123..."
 *   chapterId={1}
 *   lessonId={1}
 *   title="Introduction to Blockchain"
 *   description="Learn the fundamentals of blockchain technology"
 *   isUnlocked={true}
 * />
 * ```
 */
interface LessonProgressCardProps {
  userId: string
  chapterId: number
  lessonId: number
  title: string
  description: string
  isUnlocked: boolean
  onComplete?: (chapterId: number, lessonId: number) => void
}

export function LessonProgressCard({
  userId,
  chapterId,
  lessonId,
  title,
  description,
  isUnlocked,
  onComplete
}: LessonProgressCardProps) {
  const {
    markLessonComplete,
    getUserProgress,
    isChapterComplete,
    isLoading: progressLoading,
    error: progressError,
    clearError: clearProgressError,
    subscribeToEvents
  } = useProgressTracker()

  const {
    mintBadge,
    hasBadge,
    isLoading: badgeLoading,
    error: badgeError,
    clearError: clearBadgeError,
    subscribeToEvents: subscribeToBadgeEvents
  } = useBadgeTracker()

  const [isCompleted, setIsCompleted] = useState(false)
  const [isOptimisticallyCompleted, setIsOptimisticallyCompleted] = useState(false)
  const [showBadgeNotification, setShowBadgeNotification] = useState(false)
  const [chapterCompleted, setChapterCompleted] = useState(false)

  // Load initial progress state
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await getUserProgress(userId, chapterId)
        setIsCompleted(progress.includes(lessonId))
        
        const chapterComplete = await isChapterComplete(userId, chapterId)
        setChapterCompleted(chapterComplete)
      } catch (error) {
        console.error('Failed to load progress:', error)
      }
    }

    if (userId && isUnlocked) {
      loadProgress()
    }
  }, [userId, chapterId, lessonId, isUnlocked, getUserProgress, isChapterComplete])

  // Subscribe to progress events
  useEffect(() => {
    const unsubscribe = subscribeToEvents(
      // Lesson completed
      (data) => {
        if (data.user === userId && data.chapter_id === chapterId && data.lesson_id === lessonId) {
          setIsCompleted(true)
          setIsOptimisticallyCompleted(false)
          onComplete?.(chapterId, lessonId)
        }
      },
      // Chapter completed
      async (data) => {
        if (data.user === userId && data.chapter_id === chapterId) {
          setChapterCompleted(true)
          
          // Auto-mint chapter completion badge
          try {
            const hasChapterBadge = await hasBadge(userId, 'ChapterCompletion', chapterId)
            if (!hasChapterBadge) {
              const badgeResult = await mintBadge(
                userId,
                'ChapterCompletion',
                chapterId,
                `Completed Chapter ${chapterId}`
              )
              
              if (badgeResult.success) {
                setShowBadgeNotification(true)
                setTimeout(() => setShowBadgeNotification(false), 5000)
              }
            }
          } catch (error) {
            console.error('Failed to mint chapter badge:', error)
          }
        }
      }
    )

    return unsubscribe
  }, [userId, chapterId, lessonId, subscribeToEvents, mintBadge, hasBadge, onComplete])

  // Subscribe to badge events
  useEffect(() => {
    const unsubscribe = subscribeToBadgeEvents((data) => {
      if (data.user === userId && data.badge.badge_type === 'ChapterCompletion' && data.badge.reference_id === chapterId) {
        setShowBadgeNotification(true)
        setTimeout(() => setShowBadgeNotification(false), 5000)
      }
    })

    return unsubscribe
  }, [userId, chapterId, subscribeToBadgeEvents])

  const handleCompleteLesson = async () => {
    if (!isUnlocked || isCompleted || progressLoading) return

    // Optimistic update
    setIsOptimisticallyCompleted(true)
    clearProgressError()
    clearBadgeError()

    try {
      const result = await markLessonComplete(userId, chapterId, lessonId)
      
      if (result.success) {
        setIsCompleted(true)
        onComplete?.(chapterId, lessonId)
      } else {
        // Revert optimistic update
        setIsOptimisticallyCompleted(false)
      }
    } catch (error) {
      // Revert optimistic update
      setIsOptimisticallyCompleted(false)
      console.error('Failed to complete lesson:', error)
    }
  }

  const isLoading = progressLoading || badgeLoading
  const hasError = progressError || badgeError
  const displayCompleted = isCompleted || isOptimisticallyCompleted

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Badge notification */}
      {showBadgeNotification && (
        <div className="absolute -top-2 -right-2 z-10 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-medium animate-bounce">
          🏆 Badge Earned!
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">
                  Chapter {chapterId} • Lesson {lessonId}
                </span>
                {chapterCompleted && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Chapter Complete
                  </span>
                )}
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm mb-4">{description}</p>

            {hasError && (
              <div className="mb-4">
                <ErrorDisplay
                  error={progressError || badgeError}
                  onRetry={() => {
                    clearProgressError()
                    clearBadgeError()
                    handleCompleteLesson()
                  }}
                  onDismiss={() => {
                    clearProgressError()
                    clearBadgeError()
                  }}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          <div className="ml-4 flex-shrink-0">
            {!isUnlocked ? (
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <LockClosedIcon className="w-6 h-6 text-gray-400" />
              </div>
            ) : displayCompleted ? (
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircleIconSolid className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <button
                onClick={handleCompleteLesson}
                disabled={isLoading}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <PlayIcon className="w-6 h-6 text-white ml-0.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                displayCompleted ? 'bg-green-500 w-full' : 'bg-blue-500 w-0'
              }`}
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {displayCompleted ? 'Complete' : 'Not Started'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          {!isUnlocked && (
            <span className="text-sm text-gray-500">
              Complete previous lessons to unlock
            </span>
          )}
          
          {isUnlocked && !displayCompleted && (
            <button
              onClick={handleCompleteLesson}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors"
            >
              {isLoading ? 'Completing...' : 'Start Lesson'}
            </button>
          )}

          {displayCompleted && (
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                Lesson completed!
              </span>
            </div>
          )}
        </div>

        {/* Optimistic update indicator */}
        {isOptimisticallyCompleted && !isCompleted && (
          <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
            <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
            Saving progress...
          </div>
        )}
      </div>
    </div>
  )
}
