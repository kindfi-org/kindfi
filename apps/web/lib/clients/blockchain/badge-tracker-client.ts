/**
 * Badge Tracker API client for HTTP communication with Docker container
 */

import { BaseHttpClient } from './base-client'
import type { 
  BadgeTrackerApi, 
  ApiResponse, 
  ApiClientConfig 
} from './types'
import type { 
  Address, 
  Badge, 
  BadgeType 
} from '~/lib/types/blockchain/contract-interfaces.types'

/**
 * Badge Tracker HTTP API client
 * 
 * @example
 * ```typescript
 * const client = new BadgeTrackerClient({
 *   baseUrl: 'http://localhost:8080'
 * })
 * 
 * // Mint a badge
 * const result = await client.mintBadge(
 *   'GUSER123...',
 *   'ChapterCompletion',
 *   1,
 *   'Completed Chapter 1'
 * )
 * 
 * if (result.success) {
 *   console.log('Badge minted:', result.data)
 * } else {
 *   console.error('Failed:', result.error)
 * }
 * ```
 */
export class BadgeTrackerClient extends BaseHttpClient implements BadgeTrackerApi {
  constructor(config: Partial<ApiClientConfig> = {}) {
    super(config)
  }

  /**
   * Mint a new badge for a user
   * 
   * @param user - User's blockchain address
   * @param badgeType - Type of badge to mint
   * @param referenceId - Reference ID for the badge
   * @param description - Human-readable description
   * @returns Promise with minted badge data
   */
  async mintBadge(
    user: Address,
    badgeType: BadgeType,
    referenceId: number,
    description: string
  ): Promise<ApiResponse<Badge>> {
    return this.request<Badge>('/badge-tracker/mint-badge', {
      method: 'POST',
      body: JSON.stringify({
        user,
        badge_type: badgeType,
        reference_id: referenceId,
        description
      })
    })
  }

  /**
   * Get all badges for a specific user
   * 
   * @param user - User's blockchain address
   * @returns Promise with array of user's badges
   */
  async getUserBadges(user: Address): Promise<ApiResponse<Badge[]>> {
    return this.request<Badge[]>('/badge-tracker/get-user-badges', {
      method: 'GET',
      body: JSON.stringify({ user })
    })
  }

  /**
   * Get badges of a specific type and reference ID
   * 
   * @param badgeType - Type of badge to query
   * @param referenceId - Reference ID for the badge
   * @returns Promise with array of matching badges
   */
  async getBadgesByType(
    badgeType: BadgeType,
    referenceId: number
  ): Promise<ApiResponse<Badge[]>> {
    return this.request<Badge[]>('/badge-tracker/get-badges-by-type', {
      method: 'GET',
      body: JSON.stringify({
        badge_type: badgeType,
        reference_id: referenceId
      })
    })
  }

  /**
   * Check if a user has a specific badge
   * 
   * @param user - User's blockchain address
   * @param badgeType - Type of badge to check
   * @param referenceId - Reference ID for the badge
   * @returns Promise with boolean indicating badge ownership
   */
  async hasBadge(
    user: Address,
    badgeType: BadgeType,
    referenceId: number
  ): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('/badge-tracker/has-badge', {
      method: 'GET',
      body: JSON.stringify({
        user,
        badge_type: badgeType,
        reference_id: referenceId
      })
    })
  }

  /**
   * Get global badge statistics
   * 
   * @returns Promise with badge statistics
   */
  async getBadgeStats(): Promise<ApiResponse<{
    totalBadges: number
    badgesByType: Record<BadgeType, number>
    topBadgeHolders: Array<{
      user: Address
      badgeCount: number
    }>
    recentBadges: Badge[]
  }>> {
    return this.request('/badge-tracker/get-badge-stats', {
      method: 'GET'
    })
  }

  /**
   * Get badge leaderboard
   * 
   * @param badgeType - Optional badge type to filter by
   * @param limit - Maximum number of users to return
   * @returns Promise with leaderboard data
   */
  async getBadgeLeaderboard(
    badgeType?: BadgeType,
    limit: number = 10
  ): Promise<ApiResponse<Array<{
    user: Address
    badgeCount: number
    badges: Badge[]
    rank: number
  }>>> {
    return this.request('/badge-tracker/get-leaderboard', {
      method: 'GET',
      body: JSON.stringify({
        badge_type: badgeType,
        limit
      })
    })
  }

  /**
   * Bulk mint badges (admin operation)
   * 
   * @param admin - Admin's blockchain address
   * @param operations - Array of badge minting operations
   * @returns Promise with bulk operation results
   */
  async bulkMintBadges(
    admin: Address,
    operations: Array<{
      user: Address
      badgeType: BadgeType
      referenceId: number
      description: string
    }>
  ): Promise<ApiResponse<{
    successful: Badge[]
    failed: Array<{
      operation: any
      reason: string
    }>
  }>> {
    return this.request('/badge-tracker/bulk-mint', {
      method: 'POST',
      body: JSON.stringify({
        admin,
        operations
      })
    })
  }

  /**
   * Revoke a badge (admin operation)
   * 
   * @param admin - Admin's blockchain address
   * @param user - User's blockchain address
   * @param badgeType - Type of badge to revoke
   * @param referenceId - Reference ID for the badge
   * @returns Promise with operation result
   */
  async revokeBadge(
    admin: Address,
    user: Address,
    badgeType: BadgeType,
    referenceId: number
  ): Promise<ApiResponse<void>> {
    return this.request<void>('/badge-tracker/revoke-badge', {
      method: 'POST',
      body: JSON.stringify({
        admin,
        user,
        badge_type: badgeType,
        reference_id: referenceId
      })
    })
  }

  /**
   * Get badge validation requirements
   * 
   * @param user - User's blockchain address
   * @param badgeType - Type of badge to validate
   * @param referenceId - Reference ID for the badge
   * @returns Promise with validation result
   */
  async validateBadgeRequirements(
    user: Address,
    badgeType: BadgeType,
    referenceId: number
  ): Promise<ApiResponse<{
    canMint: boolean
    reason: string
    requirements: string[]
    missingRequirements: string[]
  }>> {
    return this.request('/badge-tracker/validate-requirements', {
      method: 'GET',
      body: JSON.stringify({
        user,
        badge_type: badgeType,
        reference_id: referenceId
      })
    })
  }

  /**
   * Get badge metadata and display information
   * 
   * @param badgeType - Type of badge
   * @param referenceId - Reference ID for the badge
   * @returns Promise with badge metadata
   */
  async getBadgeMetadata(
    badgeType: BadgeType,
    referenceId: number
  ): Promise<ApiResponse<{
    name: string
    description: string
    imageUrl?: string
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
    requirements: string[]
    category: string
  }>> {
    return this.request('/badge-tracker/get-metadata', {
      method: 'GET',
      body: JSON.stringify({
        badge_type: badgeType,
        reference_id: referenceId
      })
    })
  }

  /**
   * Subscribe to badge events via Server-Sent Events
   * 
   * @param user - User to subscribe to (optional, subscribes to all if not provided)
   * @param onEvent - Callback for badge events
   * @returns Function to unsubscribe
   */
  subscribeToBadgeEvents(
    onEvent: (event: {
      type: 'badge_minted' | 'badge_revoked'
      user: Address
      badge: Badge
      timestamp: number
    }) => void,
    user?: Address
  ): () => void {
    const url = user 
      ? `/badge-tracker/events?user=${encodeURIComponent(user)}`
      : '/badge-tracker/events'
    
    const eventSource = new EventSource(`${this.config.baseUrl}${url}`)
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onEvent(data)
      } catch (error) {
        console.error('Failed to parse badge event:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('Badge events connection error:', error)
    }

    // Return cleanup function
    return () => {
      eventSource.close()
    }
  }

  /**
   * Health check for badge tracker service
   * 
   * @returns Promise with health status
   */
  async healthCheck(): Promise<ApiResponse<{
    status: 'healthy' | 'unhealthy'
    uptime: number
    version: string
    totalBadges: number
  }>> {
    return this.request('/badge-tracker/health', {
      method: 'GET',
      timeout: 5000
    })
  }
}
