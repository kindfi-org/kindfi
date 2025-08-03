'use client'

import { useState, useCallback } from 'react'
import { MockBlockchainServiceFactory } from '~/lib/services/blockchain/mock-service-factory'
import type { 
  Address, 
  NFTError, 
  GraduationNFT,
  Result
} from '~/lib/types/blockchain/contract-interfaces.types'

/**
 * Hook for managing graduation NFT operations in the blockchain learning platform
 * 
 * @example
 * ```tsx
 * function GraduationComponent({ userId }) {
 *   const {
 *     mintGraduationNFT,
 *     getGraduationNFT,
 *     hasGraduationNFT,
 *     checkEligibility,
 *     isLoading,
 *     error,
 *     clearError
 *   } = useGraduationNFT()
 * 
 *   const handleMintNFT = async () => {
 *     const eligibility = await checkEligibility(userId)
 *     if (eligibility.eligible) {
 *       const result = await mintGraduationNFT(userId)
 *       if (result.success) {
 *         console.log('Graduation NFT minted!')
 *       }
 *     }
 *   }
 * 
 *   return (
 *     <button onClick={handleMintNFT} disabled={isLoading}>
 *       {isLoading ? 'Minting...' : 'Mint Graduation NFT'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useGraduationNFT() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nftCache, setNftCache] = useState<Map<Address, GraduationNFT | null>>(new Map())
  const [eligibilityCache, setEligibilityCache] = useState<Map<Address, any>>(new Map())

  // Get service instance
  const getService = useCallback(() => {
    const factory = MockBlockchainServiceFactory.getInstance({
      environment: process.env.NODE_ENV === 'production' ? 'demo' : 'development',
      autoInitialize: true,
    })
    return factory.getGraduationNFT()
  }, [])

  /**
   * Clear any existing error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Mint a graduation NFT for a user
   * 
   * @param recipient - User's blockchain address
   * @returns Promise with operation result
   */
  const mintGraduationNFT = useCallback(async (
    recipient: Address
  ): Promise<Result<GraduationNFT, NFTError>> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const result = await service.mint_graduation_nft(recipient)

      if (result.success) {
        // Update cache with new NFT
        setNftCache(prev => new Map(prev).set(recipient, result.data))
        
        // Invalidate eligibility cache
        setEligibilityCache(prev => {
          const newCache = new Map(prev)
          newCache.delete(recipient)
          return newCache
        })
      } else {
        setError(`Failed to mint graduation NFT: ${result.error}`)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return { success: false, error: NFTError.UnknownError }
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Get graduation NFT for a user
   * 
   * @param user - User's blockchain address
   * @param useCache - Whether to use cached data if available
   * @returns Promise with graduation NFT or null if not found
   */
  const getGraduationNFT = useCallback(async (
    user: Address,
    useCache = true
  ): Promise<GraduationNFT | null> => {
    // Return cached data if available and requested
    if (useCache && nftCache.has(user)) {
      return nftCache.get(user)!
    }

    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const nft = await service.get_graduation_nft(user)

      // Cache the result
      setNftCache(prev => new Map(prev).set(user, nft))

      return nft
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch graduation NFT'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getService, nftCache])

  /**
   * Check if a user has a graduation NFT
   * 
   * @param user - User's blockchain address
   * @returns Promise with boolean indicating NFT ownership
   */
  const hasGraduationNFT = useCallback(async (user: Address): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      return await service.has_graduation_nft(user)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check NFT ownership'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Check user's eligibility for graduation NFT
   * 
   * @param user - User's blockchain address
   * @param useCache - Whether to use cached eligibility data
   * @returns Promise with detailed eligibility information
   */
  const checkEligibility = useCallback(async (
    user: Address,
    useCache = true
  ) => {
    // Return cached data if available and requested
    if (useCache && eligibilityCache.has(user)) {
      return eligibilityCache.get(user)!
    }

    setIsLoading(true)
    setError(null)

    try {
      const factory = MockBlockchainServiceFactory.getInstance()
      const progressService = factory.getProgressTracker()
      const badgeService = factory.getBadgeTracker()

      // Check if user already has NFT
      const hasNFT = await hasGraduationNFT(user)
      if (hasNFT) {
        const result = {
          eligible: false,
          reason: 'User already has graduation NFT',
          requirements: {
            hasNFT: true,
            progress: null,
            badges: null
          }
        }
        setEligibilityCache(prev => new Map(prev).set(user, result))
        return result
      }

      // Check progress requirements
      const overallProgress = await progressService.get_user_overall_progress(user)
      const progressMet = overallProgress.overallPercentage >= 80 && overallProgress.completedChapters >= 3

      // Check badge requirements
      const userBadges = await badgeService.get_user_badges(user)
      const badgesMet = userBadges.length >= 5

      const eligible = progressMet && badgesMet

      const result = {
        eligible,
        reason: eligible 
          ? 'All requirements met' 
          : 'Requirements not met',
        requirements: {
          hasNFT: false,
          progress: {
            met: progressMet,
            current: {
              percentage: overallProgress.overallPercentage,
              completedChapters: overallProgress.completedChapters
            },
            required: {
              percentage: 80,
              completedChapters: 3
            }
          },
          badges: {
            met: badgesMet,
            current: userBadges.length,
            required: 5
          }
        }
      }

      // Cache the result
      setEligibilityCache(prev => new Map(prev).set(user, result))

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check eligibility'
      setError(errorMessage)
      return {
        eligible: false,
        reason: errorMessage,
        requirements: null
      }
    } finally {
      setIsLoading(false)
    }
  }, [hasGraduationNFT, eligibilityCache])

  /**
   * Get graduation statistics
   * 
   * @returns Promise with global graduation statistics
   */
  const getGraduationStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      return await service.get_graduation_stats()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch graduation statistics'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Get all graduation NFT holders
   * 
   * @returns Promise with array of holder addresses
   */
  const getAllHolders = useCallback(async (): Promise<Address[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      return await service.get_all_holders()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch NFT holders'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Attempt to transfer NFT (will always fail for soulbound tokens)
   * 
   * @param from - Current owner address
   * @param to - Intended recipient address
   * @param tokenId - Token ID (placeholder)
   * @returns Promise with transfer result (always fails)
   */
  const attemptTransfer = useCallback(async (
    from: Address,
    to: Address,
    tokenId: number = 1
  ): Promise<Result<void, NFTError>> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const result = await service.attempt_transfer(from, to, tokenId)
      
      if (!result.success) {
        setError(`Transfer failed: ${result.error}`)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transfer attempt failed'
      setError(errorMessage)
      return { success: false, error: NFTError.TransferNotAllowed }
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Clear all cached data
   */
  const clearCache = useCallback(() => {
    setNftCache(new Map())
    setEligibilityCache(new Map())
  }, [])

  /**
   * Get detailed NFT metadata for display
   * 
   * @param user - User's blockchain address
   * @returns Promise with formatted NFT data for UI display
   */
  const getNFTDisplayData = useCallback(async (user: Address) => {
    const nft = await getGraduationNFT(user)
    
    if (!nft) {
      return null
    }

    return {
      owner: nft.owner,
      issuedAt: new Date(nft.metadata.issued_at),
      version: nft.metadata.version,
      badgeCount: nft.metadata.badges.length,
      badges: nft.metadata.badges,
      formattedIssueDate: new Date(nft.metadata.issued_at).toLocaleDateString(),
      timeSinceIssue: Date.now() - nft.metadata.issued_at,
    }
  }, [getGraduationNFT])

  return {
    // Actions
    mintGraduationNFT,
    getGraduationNFT,
    hasGraduationNFT,
    checkEligibility,
    getGraduationStats,
    getAllHolders,
    attemptTransfer,
    getNFTDisplayData,
    clearCache,
    clearError,

    // State
    isLoading,
    error,

    // Cache state (for debugging/optimization)
    nftCacheSize: nftCache.size,
    eligibilityCacheSize: eligibilityCache.size,
  }
}
