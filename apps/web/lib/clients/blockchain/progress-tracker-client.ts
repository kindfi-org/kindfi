/**
 * Progress Tracker API client for HTTP communication with Docker container
 */

import { BaseHttpClient } from './base-client'
import type { 
  ProgressTrackerApi, 
  ApiResponse, 
  ApiClientConfig 
} from './types'
import type { 
  Address, 
  UserOverallProgress 
} from '~/lib/types/blockchain/contract-interfaces.types'

/**
 * Progress Tracker HTTP API client
 * 
 * @example
 * ```typescript
 * const client = new ProgressTrackerClient({
 *   baseUrl: 'http://localhost:8080'
 * })
 * 
 * // Mark lesson complete
 * const result = await client.markLessonComplete(
 *   'GUSER123...',
 *   1,
 *   1
 * )
 * 
 * if (result.success) {
 *   console.log('Lesson marked complete!')
 * } else {
 *   console.error('Failed:', result.error)
 * }
 * ```
 */
export class ProgressTrackerClient extends BaseHttpClient implements ProgressTrackerApi {
  constructor(config: Partial<ApiClientConfig> = {}) {
    super(config)
  }

  /**
   * Mark a lesson as complete for a user
   * 
   * @param user - User's blockchain address
   * @param chapterId - Chapter identifier
   * @param lessonId - Lesson identifier
   * @returns Promise with operation result
   */
  async markLessonComplete(
    user: Address,
    chapterId: number,
    lessonId: number
  ): Promise<ApiResponse<void>> {
    return this.request<void>('/progress-tracker/mark-lesson-complete', {
      method: 'POST',
      body: JSON.stringify({
        user,
        chapter_id: chapterId,
        lesson_id: lessonId
      })
    })
  }

  /**
   * Get user's progress for a specific chapter
   * 
   * @param user - User's blockchain address
   * @param chapterId - Chapter identifier
   * @returns Promise with array of completed lesson IDs
   */
  async getUserProgress(
    user: Address,
    chapterId: number
  ): Promise<ApiResponse<number[]>> {
    return this.request<number[]>('/progress-tracker/get-progress', {
      method: 'GET',
      body: JSON.stringify({
        user,
        chapter_id: chapterId
      })
    })
  }

  /**
   * Get user's overall progress across all chapters
   * 
   * @param user - User's blockchain address
   * @returns Promise with overall progress information
   */
  async getOverallProgress(user: Address): Promise<ApiResponse<UserOverallProgress>> {
    return this.request<UserOverallProgress>('/progress-tracker/get-overall-progress', {
      method: 'GET',
      body: JSON.stringify({ user })
    })
  }

  /**
   * Check if a chapter is complete for a user
   * 
   * @param user - User's blockchain address
   * @param chapterId - Chapter identifier
   * @returns Promise with completion status
   */
  async isChapterComplete(
    user: Address,
    chapterId: number
  ): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('/progress-tracker/is-chapter-complete', {
      method: 'GET',
      body: JSON.stringify({
        user,
        chapter_id: chapterId
      })
    })
  }

  /**
   * Get chapter configuration
   * 
   * @param chapterId - Chapter identifier
   * @returns Promise with chapter configuration
   */
  async getChapterConfig(chapterId: number): Promise<ApiResponse<any>> {
    return this.request<any>('/progress-tracker/get-chapter-config', {
      method: 'GET',
      body: JSON.stringify({
        chapter_id: chapterId
      })
    })
  }

  /**
   * Get progress statistics for a user
   * 
   * @param user - User's blockchain address
   * @returns Promise with progress statistics
   */
  async getProgressStats(user: Address): Promise<ApiResponse<{
    totalChapters: number
    completedChapters: number
    totalLessons: number
    completedLessons: number
    overallPercentage: number
    lastActivity: number
  }>> {
    return this.request('/progress-tracker/get-progress-stats', {
      method: 'GET',
      body: JSON.stringify({ user })
    })
  }

  /**
   * Get leaderboard data
   * 
   * @param limit - Maximum number of users to return
   * @returns Promise with leaderboard data
   */
  async getLeaderboard(limit: number = 10): Promise<ApiResponse<Array<{
    user: Address
    completedChapters: number
    overallPercentage: number
    rank: number
  }>>> {
    return this.request('/progress-tracker/get-leaderboard', {
      method: 'GET',
      body: JSON.stringify({ limit })
    })
  }

  /**
   * Reset user progress (admin operation)
   * 
   * @param admin - Admin's blockchain address
   * @param user - User's blockchain address
   * @param chapterId - Optional chapter ID to reset specific chapter
   * @returns Promise with operation result
   */
  async resetUserProgress(
    admin: Address,
    user: Address,
    chapterId?: number
  ): Promise<ApiResponse<void>> {
    return this.request<void>('/progress-tracker/reset-progress', {
      method: 'POST',
      body: JSON.stringify({
        admin,
        user,
        chapter_id: chapterId
      })
    })
  }

  /**
   * Bulk mark lessons complete (for testing/admin purposes)
   * 
   * @param admin - Admin's blockchain address
   * @param operations - Array of lesson completion operations
   * @returns Promise with bulk operation results
   */
  async bulkMarkLessonsComplete(
    admin: Address,
    operations: Array<{
      user: Address
      chapterId: number
      lessonId: number
    }>
  ): Promise<ApiResponse<{
    successful: number
    failed: Array<{
      operation: any
      reason: string
    }>
  }>> {
    return this.request('/progress-tracker/bulk-mark-complete', {
      method: 'POST',
      body: JSON.stringify({
        admin,
        operations
      })
    })
  }

  /**
   * Get global progress statistics
   * 
   * @returns Promise with global statistics
   */
  async getGlobalStats(): Promise<ApiResponse<{
    totalUsers: number
    totalLessonsCompleted: number
    totalChaptersCompleted: number
    averageProgress: number
    mostActiveUsers: Array<{
      user: Address
      completedLessons: number
    }>
  }>> {
    return this.request('/progress-tracker/global-stats', {
      method: 'GET'
    })
  }

  /**
   * Subscribe to progress events via Server-Sent Events
   * 
   * @param user - User to subscribe to (optional, subscribes to all if not provided)
   * @param onEvent - Callback for progress events
   * @returns Function to unsubscribe
   */
  subscribeToProgressEvents(
    onEvent: (event: {
      type: 'lesson_completed' | 'chapter_completed'
      user: Address
      chapterId?: number
      lessonId?: number
      timestamp: number
    }) => void,
    user?: Address
  ): () => void {
    const url = user 
      ? `/progress-tracker/events?user=${encodeURIComponent(user)}`
      : '/progress-tracker/events'
    
    const eventSource = new EventSource(`${this.config.baseUrl}${url}`)
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onEvent(data)
      } catch (error) {
        console.error('Failed to parse progress event:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Progress events connection error:', error)
    }

    // Return cleanup function
    return () => {
      eventSource.close()
    }
  }

  /**
   * Health check for progress tracker service
   * 
   * @returns Promise with health status
   */
  async healthCheck(): Promise<ApiResponse<{
    status: 'healthy' | 'unhealthy'
    uptime: number
    version: string
    lastActivity: number
  }>> {
    return this.request('/progress-tracker/health', {
      method: 'GET',
      timeout: 5000 // Short timeout for health checks
    })
  }
}
