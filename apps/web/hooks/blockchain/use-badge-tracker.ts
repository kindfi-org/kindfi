'use client'

import { useState, useCallback } from 'react'
import { MockBlockchainServiceFactory } from '~/lib/services/blockchain/mock-service-factory'
import type { 
  Address, 
  BadgeError, 
  Badge,
  BadgeType,
  Result,
  BadgeMintedEventData
} from '~/lib/types/blockchain/contract-interfaces.types'

/**
 * Hook for managing badge operations in the blockchain learning platform
 * 
 * @example
 * ```tsx
 * function BadgeComponent({ userId }) {
 *   const {
 *     mintBadge,
 *     getUserBadges,
 *     getBadgesByType,
 *     isLoading,
 *     error,
 *     clearError
 *   } = useBadgeTracker()
 * 
 *   const handleMintBadge = async () => {
 *     const result = await mintBadge(
 *       userId,
 *       'ChapterCompletion',
 *       1,
 *       'Completed Chapter 1'
 *     )
 *     if (result.success) {
 *       console.log('Badge minted successfully!')
 *     }
 *   }
 * 
 *   return (
 *     <button onClick={handleMintBadge} disabled={isLoading}>
 *       {isLoading ? 'Minting...' : 'Mint Badge'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useBadgeTracker() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [badgeCache, setBadgeCache] = useState<Map<Address, Badge[]>>(new Map())
  const [badgeTypeCache, setBadgeTypeCache] = useState<Map<string, Badge[]>>(new Map())

  // Get service instance
  const getService = useCallback(() => {
    const factory = MockBlockchainServiceFactory.getInstance({
      environment: process.env.NODE_ENV === 'production' ? 'demo' : 'development',
      autoInitialize: true,
    })
    return factory.getBadgeTracker()
  }, [])

  /**
   * Clear any existing error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Mint a new badge for a user
   * 
   * @param user - User's blockchain address
   * @param badgeType - Type of badge to mint
   * @param referenceId - Reference ID for the badge (e.g., chapter number)
   * @param description - Human-readable description of the achievement
   * @returns Promise with operation result
   */
  const mintBadge = useCallback(async (
    user: Address,
    badgeType: BadgeType,
    referenceId: number,
    description: string
  ): Promise<Result<Badge, BadgeError>> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const result = await service.mint_badge(user, badgeType, referenceId, description)

      if (result.success) {
        // Invalidate relevant caches
        setBadgeCache(prev => {
          const newCache = new Map(prev)
          newCache.delete(user)
          return newCache
        })

        const typeKey = `${badgeType}_${referenceId}`
        setBadgeTypeCache(prev => {
          const newCache = new Map(prev)
          newCache.delete(typeKey)
          return newCache
        })
      } else {
        setError(`Failed to mint badge: ${result.error}`)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return { success: false, error: BadgeError.UnknownError }
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Get all badges for a specific user
   * 
   * @param user - User's blockchain address
   * @param useCache - Whether to use cached data if available
   * @returns Promise with array of user's badges
   */
  const getUserBadges = useCallback(async (
    user: Address,
    useCache = true
  ): Promise<Badge[]> => {
    // Return cached data if available and requested
    if (useCache && badgeCache.has(user)) {
      return badgeCache.get(user)!
    }

    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const badges = await service.get_user_badges(user)

      // Cache the result
      setBadgeCache(prev => new Map(prev).set(user, badges))

      return badges
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user badges'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getService, badgeCache])

  /**
   * Get badges of a specific type and reference ID
   * 
   * @param badgeType - Type of badge to query
   * @param referenceId - Reference ID for the badge
   * @param useCache - Whether to use cached data if available
   * @returns Promise with array of matching badges
   */
  const getBadgesByType = useCallback(async (
    badgeType: BadgeType,
    referenceId: number,
    useCache = true
  ): Promise<Badge[]> => {
    const cacheKey = `${badgeType}_${referenceId}`
    
    // Return cached data if available and requested
    if (useCache && badgeTypeCache.has(cacheKey)) {
      return badgeTypeCache.get(cacheKey)!
    }

    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const badges = await service.get_badges_by_type(badgeType, referenceId)

      // Cache the result
      setBadgeTypeCache(prev => new Map(prev).set(cacheKey, badges))

      return badges
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch badges by type'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getService, badgeTypeCache])

  /**
   * Check if a user has a specific badge
   * 
   * @param user - User's blockchain address
   * @param badgeType - Type of badge to check
   * @param referenceId - Reference ID for the badge
   * @returns Promise with boolean indicating if user has the badge
   */
  const hasBadge = useCallback(async (
    user: Address,
    badgeType: BadgeType,
    referenceId: number
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      return await service.has_badge(user, badgeType, referenceId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check badge ownership'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Get badge statistics for a user
   * 
   * @param user - User's blockchain address
   * @returns Promise with badge statistics
   */
  const getUserBadgeStats = useCallback(async (user: Address) => {
    setIsLoading(true)
    setError(null)

    try {
      const badges = await getUserBadges(user, true)
      
      // Calculate statistics
      const stats = {
        totalBadges: badges.length,
        badgesByType: badges.reduce((acc, badge) => {
          acc[badge.badge_type] = (acc[badge.badge_type] || 0) + 1
          return acc
        }, {} as Record<BadgeType, number>),
        latestBadge: badges.length > 0 
          ? badges.reduce((latest, current) => 
              current.minted_at > latest.minted_at ? current : latest
            )
          : null,
        oldestBadge: badges.length > 0
          ? badges.reduce((oldest, current) => 
              current.minted_at < oldest.minted_at ? current : oldest
            )
          : null,
      }

      return stats
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate badge statistics'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getUserBadges])

  /**
   * Get global badge statistics
   * 
   * @returns Promise with global badge statistics
   */
  const getGlobalBadgeStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      return await service.get_badge_stats()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch global badge statistics'
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
    setBadgeCache(new Map())
    setBadgeTypeCache(new Map())
  }, [])

  /**
   * Subscribe to badge events
   */
  const subscribeToEvents = useCallback((
    onBadgeMinted?: (data: BadgeMintedEventData) => void
  ) => {
    const service = getService()

    if (onBadgeMinted) {
      service.on('badge_minted', onBadgeMinted)
    }

    // Return cleanup function
    return () => {
      // Note: In a real implementation, you'd want to remove specific listeners
      // For now, this is a placeholder for the cleanup pattern
    }
  }, [getService])

  /**
   * Validate badge requirements (useful for UI feedback)
   * 
   * @param user - User's blockchain address
   * @param badgeType - Type of badge to validate
   * @param referenceId - Reference ID for the badge
   * @returns Promise with validation result and requirements
   */
  const validateBadgeRequirements = useCallback(async (
    user: Address,
    badgeType: BadgeType,
    referenceId: number
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if badge already exists
      const hasExisting = await hasBadge(user, badgeType, referenceId)
      if (hasExisting) {
        return {
          canMint: false,
          reason: 'Badge already exists',
          requirements: []
        }
      }

      // For chapter completion badges, check if chapter is actually complete
      if (badgeType === 'ChapterCompletion') {
        const factory = MockBlockchainServiceFactory.getInstance()
        const progressService = factory.getProgressTracker()
        const isComplete = await progressService.is_chapter_complete(user, referenceId)
        
        return {
          canMint: isComplete,
          reason: isComplete ? 'Requirements met' : 'Chapter not completed',
          requirements: isComplete ? [] : [`Complete all lessons in chapter ${referenceId}`]
        }
      }

      // Default validation - assume requirements are met
      return {
        canMint: true,
        reason: 'Requirements met',
        requirements: []
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate badge requirements'
      setError(errorMessage)
      return {
        canMint: false,
        reason: errorMessage,
        requirements: []
      }
    } finally {
      setIsLoading(false)
    }
  }, [hasBadge])

  return {
    // Actions
    mintBadge,
    getUserBadges,
    getBadgesByType,
    hasBadge,
    getUserBadgeStats,
    getGlobalBadgeStats,
    validateBadgeRequirements,
    clearCache,
    subscribeToEvents,
    clearError,

    // State
    isLoading,
    error,

    // Cache state (for debugging/optimization)
    badgeCacheSize: badgeCache.size,
    badgeTypeCacheSize: badgeTypeCache.size,
  }
}
