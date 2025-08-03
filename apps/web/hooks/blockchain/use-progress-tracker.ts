'use client'

import { useState, useCallback, useEffect } from 'react'
import { MockBlockchainServiceFactory } from '~/lib/services/blockchain/mock-service-factory'
import type { 
  Address, 
  ProgressError, 
  UserOverallProgress,
  Result 
} from '~/lib/types/blockchain/contract-interfaces.types'

/**
 * Hook for managing user progress tracking in the blockchain learning platform
 * 
 * @example
 * ```tsx
 * function LessonComponent({ userId, chapterId, lessonId }) {
 *   const {
 *     markLessonComplete,
 *     getUserProgress,
 *     getOverallProgress,
 *     isLoading,
 *     error,
 *     clearError
 *   } = useProgressTracker()
 * 
 *   const handleCompleteLesson = async () => {
 *     const result = await markLessonComplete(userId, chapterId, lessonId)
 *     if (result.success) {
 *       console.log('Lesson completed!')
 *     }
 *   }
 * 
 *   return (
 *     <button onClick={handleCompleteLesson} disabled={isLoading}>
 *       {isLoading ? 'Completing...' : 'Complete Lesson'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useProgressTracker() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progressCache, setProgressCache] = useState<Map<string, number[]>>(new Map())
  const [overallProgressCache, setOverallProgressCache] = useState<Map<Address, UserOverallProgress>>(new Map())

  // Get service instance
  const getService = useCallback(() => {
    const factory = MockBlockchainServiceFactory.getInstance({
      environment: process.env.NODE_ENV === 'production' ? 'demo' : 'development',
      autoInitialize: true,
    })
    return factory.getProgressTracker()
  }, [])

  /**
   * Clear any existing error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Mark a lesson as complete for a user
   * 
   * @param user - User's blockchain address
   * @param chapterId - Chapter identifier
   * @param lessonId - Lesson identifier within the chapter
   * @returns Promise with operation result
   */
  const markLessonComplete = useCallback(async (
    user: Address,
    chapterId: number,
    lessonId: number
  ): Promise<Result<void, ProgressError>> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const result = await service.mark_lesson_complete(user, chapterId, lessonId)

      if (result.success) {
        // Invalidate cache for this user/chapter
        const cacheKey = `${user}_${chapterId}`
        setProgressCache(prev => {
          const newCache = new Map(prev)
          newCache.delete(cacheKey)
          return newCache
        })

        // Invalidate overall progress cache
        setOverallProgressCache(prev => {
          const newCache = new Map(prev)
          newCache.delete(user)
          return newCache
        })
      } else {
        setError(`Failed to mark lesson complete: ${result.error}`)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return { success: false, error: ProgressError.UnknownError }
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Get user's progress for a specific chapter
   * 
   * @param user - User's blockchain address
   * @param chapterId - Chapter identifier
   * @param useCache - Whether to use cached data if available
   * @returns Promise with array of completed lesson IDs
   */
  const getUserProgress = useCallback(async (
    user: Address,
    chapterId: number,
    useCache = true
  ): Promise<number[]> => {
    const cacheKey = `${user}_${chapterId}`
    
    // Return cached data if available and requested
    if (useCache && progressCache.has(cacheKey)) {
      return progressCache.get(cacheKey)!
    }

    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const progress = await service.get_user_progress(user, chapterId)

      // Cache the result
      setProgressCache(prev => new Map(prev).set(cacheKey, progress))

      return progress
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user progress'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getService, progressCache])

  /**
   * Get user's overall progress across all chapters
   * 
   * @param user - User's blockchain address
   * @param useCache - Whether to use cached data if available
   * @returns Promise with overall progress information
   */
  const getOverallProgress = useCallback(async (
    user: Address,
    useCache = true
  ): Promise<UserOverallProgress | null> => {
    // Return cached data if available and requested
    if (useCache && overallProgressCache.has(user)) {
      return overallProgressCache.get(user)!
    }

    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const progress = await service.get_user_overall_progress(user)

      // Cache the result
      setOverallProgressCache(prev => new Map(prev).set(user, progress))

      return progress
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch overall progress'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getService, overallProgressCache])

  /**
   * Check if a specific chapter is complete for a user
   * 
   * @param user - User's blockchain address
   * @param chapterId - Chapter identifier
   * @returns Promise with completion status
   */
  const isChapterComplete = useCallback(async (
    user: Address,
    chapterId: number
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      return await service.is_chapter_complete(user, chapterId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check chapter completion'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Get chapter configuration (total lessons, etc.)
   * 
   * @param chapterId - Chapter identifier
   * @returns Promise with chapter configuration
   */
  const getChapterConfig = useCallback(async (chapterId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      return await service.get_chapter_config(chapterId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chapter config'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Clear all cached data
   */
  const clearCache = useCallback(() => {
    setProgressCache(new Map())
    setOverallProgressCache(new Map())
  }, [])

  /**
   * Subscribe to progress events
   */
  const subscribeToEvents = useCallback((
    onLessonCompleted?: (data: { user: Address; chapter_id: number; lesson_id: number }) => void,
    onChapterCompleted?: (data: { user: Address; chapter_id: number }) => void
  ) => {
    const service = getService()

    if (onLessonCompleted) {
      service.on('lesson_completed', onLessonCompleted)
    }

    if (onChapterCompleted) {
      service.on('chapter_completed', onChapterCompleted)
    }

    // Return cleanup function
    return () => {
      // Note: In a real implementation, you'd want to remove specific listeners
      // For now, this is a placeholder for the cleanup pattern
    }
  }, [getService])

  return {
    // Actions
    markLessonComplete,
    getUserProgress,
    getOverallProgress,
    isChapterComplete,
    getChapterConfig,
    clearCache,
    subscribeToEvents,
    clearError,

    // State
    isLoading,
    error,

    // Cache state (for debugging/optimization)
    progressCacheSize: progressCache.size,
    overallProgressCacheSize: overallProgressCache.size,
  }
}
