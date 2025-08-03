'use client'

import { useState, useCallback } from 'react'
import { MockBlockchainServiceFactory } from '~/lib/services/blockchain/mock-service-factory'
import type { Address } from '~/lib/types/blockchain/contract-interfaces.types'

/**
 * Hook for managing blockchain authentication and user management
 * 
 * @example
 * ```tsx
 * function AuthComponent() {
 *   const {
 *     registerUser,
 *     isAuthenticated,
 *     getAuthenticatedUsers,
 *     bulkRegisterUsers,
 *     isLoading,
 *     error,
 *     clearError
 *   } = useBlockchainAuth()
 * 
 *   const handleRegister = async (userAddress: string) => {
 *     const success = await registerUser(userAddress)
 *     if (success) {
 *       console.log('User registered successfully!')
 *     }
 *   }
 * 
 *   return (
 *     <div>
 *       <button onClick={() => handleRegister('GUSER...')} disabled={isLoading}>
 *         {isLoading ? 'Registering...' : 'Register User'}
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useBlockchainAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authCache, setAuthCache] = useState<Map<Address, boolean>>(new Map())
  const [usersCache, setUsersCache] = useState<Address[] | null>(null)
  const [statsCache, setStatsCache] = useState<any>(null)

  // Get service instance
  const getService = useCallback(() => {
    const factory = MockBlockchainServiceFactory.getInstance({
      environment: process.env.NODE_ENV === 'production' ? 'demo' : 'development',
      autoInitialize: true,
    })
    return factory.getAuthController()
  }, [])

  /**
   * Clear any existing error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Register a new user (admin operation)
   * 
   * @param userAddress - User's blockchain address to register
   * @param adminAddress - Admin's blockchain address (optional, uses default if not provided)
   * @returns Promise with success status
   */
  const registerUser = useCallback(async (
    userAddress: Address,
    adminAddress?: Address
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const admin = adminAddress || 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM'
      
      await service.register_user(admin, userAddress)

      // Invalidate relevant caches
      setAuthCache(prev => {
        const newCache = new Map(prev)
        newCache.set(userAddress, true)
        return newCache
      })
      setUsersCache(null)
      setStatsCache(null)

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register user'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Check if a user is authenticated
   * 
   * @param userAddress - User's blockchain address
   * @param useCache - Whether to use cached data if available
   * @returns Promise with authentication status
   */
  const isAuthenticated = useCallback(async (
    userAddress: Address,
    useCache = true
  ): Promise<boolean> => {
    // Return cached data if available and requested
    if (useCache && authCache.has(userAddress)) {
      return authCache.get(userAddress)!
    }

    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const authenticated = await service.is_authenticated_user(userAddress)

      // Cache the result
      setAuthCache(prev => new Map(prev).set(userAddress, authenticated))

      return authenticated
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check authentication'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getService, authCache])

  /**
   * Get all authenticated users
   * 
   * @param useCache - Whether to use cached data if available
   * @returns Promise with array of authenticated user addresses
   */
  const getAuthenticatedUsers = useCallback(async (
    useCache = true
  ): Promise<Address[]> => {
    // Return cached data if available and requested
    if (useCache && usersCache) {
      return usersCache
    }

    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const users = await service.get_authenticated_users()

      // Cache the result
      setUsersCache(users)

      return users
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch authenticated users'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getService, usersCache])

  /**
   * Register multiple users in bulk
   * 
   * @param userAddresses - Array of user addresses to register
   * @param adminAddress - Admin's blockchain address (optional)
   * @returns Promise with bulk registration results
   */
  const bulkRegisterUsers = useCallback(async (
    userAddresses: Address[],
    adminAddress?: Address
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const admin = adminAddress || 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM'
      
      const result = await service.bulk_register_users(admin, userAddresses)

      // Update cache for successful registrations
      setAuthCache(prev => {
        const newCache = new Map(prev)
        result.successful.forEach(address => {
          newCache.set(address, true)
        })
        return newCache
      })

      // Invalidate users cache
      setUsersCache(null)
      setStatsCache(null)

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk register users'
      setError(errorMessage)
      return {
        successful: [],
        failed: userAddresses.map(address => ({
          address,
          reason: errorMessage
        }))
      }
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Remove/deactivate a user (admin operation)
   * 
   * @param userAddress - User's blockchain address to remove
   * @param adminAddress - Admin's blockchain address (optional)
   * @returns Promise with success status
   */
  const removeUser = useCallback(async (
    userAddress: Address,
    adminAddress?: Address
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const admin = adminAddress || 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM'
      
      await service.remove_user(admin, userAddress)

      // Update cache
      setAuthCache(prev => {
        const newCache = new Map(prev)
        newCache.set(userAddress, false)
        return newCache
      })
      setUsersCache(null)
      setStatsCache(null)

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove user'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Get authentication statistics
   * 
   * @param useCache - Whether to use cached data if available
   * @returns Promise with authentication statistics
   */
  const getAuthStats = useCallback(async (useCache = true) => {
    // Return cached data if available and requested
    if (useCache && statsCache) {
      return statsCache
    }

    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const stats = await service.get_auth_stats()

      // Cache the result
      setStatsCache(stats)

      return stats
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch auth statistics'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getService, statsCache])

  /**
   * Check if an address is an admin
   * 
   * @param address - Address to check
   * @returns Promise with admin status
   */
  const isAdmin = useCallback(async (address: Address): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      return await service.is_admin(address)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check admin status'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Get all admin addresses
   * 
   * @returns Promise with array of admin addresses
   */
  const getAdmins = useCallback(async (): Promise<Address[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      return await service.get_admins()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch admins'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Add a new admin (admin operation)
   * 
   * @param newAdminAddress - Address to make admin
   * @param currentAdminAddress - Current admin's address (optional)
   * @returns Promise with success status
   */
  const addAdmin = useCallback(async (
    newAdminAddress: Address,
    currentAdminAddress?: Address
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      const currentAdmin = currentAdminAddress || 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM'
      
      await service.add_admin(currentAdmin, newAdminAddress)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add admin'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [getService])

  /**
   * Get user registration details
   * 
   * @param userAddress - User's blockchain address
   * @returns Promise with user registration details
   */
  const getUserDetails = useCallback(async (userAddress: Address) => {
    setIsLoading(true)
    setError(null)

    try {
      const service = getService()
      return await service.get_user_details(userAddress)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user details'
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
    setAuthCache(new Map())
    setUsersCache(null)
    setStatsCache(null)
  }, [])

  /**
   * Validate address format
   * 
   * @param address - Address to validate
   * @returns Boolean indicating if address format is valid
   */
  const validateAddress = useCallback((address: string): boolean => {
    // Basic Stellar address validation (starts with G, 56 characters)
    return /^G[A-Z0-9]{55}$/.test(address)
  }, [])

  return {
    // Actions
    registerUser,
    isAuthenticated,
    getAuthenticatedUsers,
    bulkRegisterUsers,
    removeUser,
    getAuthStats,
    isAdmin,
    getAdmins,
    addAdmin,
    getUserDetails,
    validateAddress,
    clearCache,
    clearError,

    // State
    isLoading,
    error,

    // Cache state (for debugging/optimization)
    authCacheSize: authCache.size,
    hasUsersCache: usersCache !== null,
    hasStatsCache: statsCache !== null,
  }
}
