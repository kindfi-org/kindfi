/**
 * Main blockchain API client that combines all service clients
 */

import { ProgressTrackerClient } from './progress-tracker-client'
import { BadgeTrackerClient } from './badge-tracker-client'
import { BaseHttpClient } from './base-client'
import type { 
  BlockchainApiClient, 
  ApiClientConfig, 
  ApiResponse,
  ApiMetrics,
  AuthControllerApi,
  GraduationNFTApi,
  SystemApi
} from './types'
import type { 
  Address, 
  GraduationNFT 
} from '~/lib/types/blockchain/contract-interfaces.types'

/**
 * Auth Controller API implementation
 */
class AuthControllerClientImpl extends BaseHttpClient implements AuthControllerApi {
  async isAuthenticated(address: Address): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('/auth-controller/is-authenticated', {
      method: 'GET',
      body: JSON.stringify({ address })
    })
  }

  async registerUser(admin: Address, user: Address): Promise<ApiResponse<void>> {
    return this.request<void>('/auth-controller/register', {
      method: 'POST',
      body: JSON.stringify({ admin, user })
    })
  }

  async getAuthenticatedUsers(): Promise<ApiResponse<Address[]>> {
    return this.request<Address[]>('/auth-controller/users', {
      method: 'GET'
    })
  }

  async getAuthStats(): Promise<ApiResponse<any>> {
    return this.request('/auth-controller/stats', {
      method: 'GET'
    })
  }

  async bulkRegisterUsers(admin: Address, users: Address[]): Promise<ApiResponse<{ successful: Address[], failed: Array<{ address: Address, reason: string }> }>> {
    return this.request('/auth-controller/bulk-register', {
      method: 'POST',
      body: JSON.stringify({ admin, users })
    })
  }
}

/**
 * Graduation NFT API implementation
 */
class GraduationNFTClientImpl extends BaseHttpClient implements GraduationNFTApi {
  async mintGraduationNFT(recipient: Address): Promise<ApiResponse<GraduationNFT>> {
    return this.request<GraduationNFT>('/graduation-nft/mint', {
      method: 'POST',
      body: JSON.stringify({ recipient })
    })
  }

  async getGraduationNFT(user: Address): Promise<ApiResponse<GraduationNFT | null>> {
    return this.request<GraduationNFT | null>('/graduation-nft/get', {
      method: 'GET',
      body: JSON.stringify({ user })
    })
  }

  async hasGraduationNFT(user: Address): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('/graduation-nft/has', {
      method: 'GET',
      body: JSON.stringify({ user })
    })
  }

  async getGraduationStats(): Promise<ApiResponse<any>> {
    return this.request('/graduation-nft/stats', {
      method: 'GET'
    })
  }

  async getAllHolders(): Promise<ApiResponse<Address[]>> {
    return this.request<Address[]>('/graduation-nft/holders', {
      method: 'GET'
    })
  }
}

/**
 * System API implementation
 */
class SystemClientImpl extends BaseHttpClient implements SystemApi {
  async getStatus(): Promise<ApiResponse<any>> {
    return this.request('/system/status', {
      method: 'GET'
    })
  }

  async reset(): Promise<ApiResponse<void>> {
    return this.request<void>('/system/reset', {
      method: 'POST'
    })
  }

  async getHealth(): Promise<ApiResponse<{ status: string, uptime: number }>> {
    return this.request('/system/health', {
      method: 'GET',
      timeout: 5000
    })
  }
}

/**
 * Complete blockchain API client
 * 
 * @example
 * ```typescript
 * const client = new BlockchainApiClientImpl({
 *   baseUrl: 'http://localhost:8080',
 *   timeout: 30000,
 *   retryAttempts: 3
 * })
 * 
 * // Use progress tracker
 * await client.progressTracker.markLessonComplete('GUSER123...', 1, 1)
 * 
 * // Use badge tracker
 * await client.badgeTracker.mintBadge('GUSER123...', 'ChapterCompletion', 1, 'Chapter 1')
 * 
 * // Use graduation NFT
 * await client.graduationNFT.mintGraduationNFT('GUSER123...')
 * 
 * // Check system health
 * const health = await client.system.getHealth()
 * ```
 */
export class BlockchainApiClientImpl implements BlockchainApiClient {
  public readonly progressTracker: ProgressTrackerClient
  public readonly badgeTracker: BadgeTrackerClient
  public readonly authController: AuthControllerApi
  public readonly graduationNFT: GraduationNFTApi
  public readonly system: SystemApi

  private clients: BaseHttpClient[]

  constructor(config: Partial<ApiClientConfig> = {}) {
    // Initialize all service clients
    this.progressTracker = new ProgressTrackerClient(config)
    this.badgeTracker = new BadgeTrackerClient(config)
    this.authController = new AuthControllerClientImpl(config)
    this.graduationNFT = new GraduationNFTClientImpl(config)
    this.system = new SystemClientImpl(config)

    // Keep track of all clients for management operations
    this.clients = [
      this.progressTracker,
      this.badgeTracker,
      this.authController as BaseHttpClient,
      this.graduationNFT as BaseHttpClient,
      this.system as BaseHttpClient
    ]
  }

  /**
   * Get aggregated metrics from all clients
   */
  getMetrics(): ApiMetrics {
    const aggregated: ApiMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: 0,
      errorsByType: {} as any
    }

    let totalResponseTime = 0
    let totalRequests = 0

    this.clients.forEach(client => {
      const metrics = client.getMetrics()
      
      aggregated.totalRequests += metrics.totalRequests
      aggregated.successfulRequests += metrics.successfulRequests
      aggregated.failedRequests += metrics.failedRequests
      
      totalResponseTime += metrics.averageResponseTime * metrics.totalRequests
      totalRequests += metrics.totalRequests
      
      if (metrics.lastRequestTime > aggregated.lastRequestTime) {
        aggregated.lastRequestTime = metrics.lastRequestTime
      }

      // Aggregate error counts
      Object.entries(metrics.errorsByType).forEach(([type, count]) => {
        aggregated.errorsByType[type] = (aggregated.errorsByType[type] || 0) + count
      })
    })

    // Calculate weighted average response time
    aggregated.averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0

    return aggregated
  }

  /**
   * Clear cache for all clients
   */
  clearCache(): void {
    this.clients.forEach(client => client.clearCache())
  }

  /**
   * Destroy all clients and cleanup resources
   */
  destroy(): void {
    this.clients.forEach(client => client.destroy())
  }

  /**
   * Perform health check on all services
   */
  async healthCheckAll(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy'
    services: {
      progressTracker: any
      badgeTracker: any
      system: any
    }
  }> {
    const results = await Promise.allSettled([
      this.progressTracker.healthCheck(),
      this.badgeTracker.healthCheck(),
      this.system.getHealth()
    ])

    const services = {
      progressTracker: results[0].status === 'fulfilled' ? results[0].value : { success: false, error: 'Health check failed' },
      badgeTracker: results[1].status === 'fulfilled' ? results[1].value : { success: false, error: 'Health check failed' },
      system: results[2].status === 'fulfilled' ? results[2].value : { success: false, error: 'Health check failed' }
    }

    // Determine overall health
    const healthyCount = Object.values(services).filter(service => service.success).length
    const totalServices = Object.keys(services).length

    let overall: 'healthy' | 'degraded' | 'unhealthy'
    if (healthyCount === totalServices) {
      overall = 'healthy'
    } else if (healthyCount > 0) {
      overall = 'degraded'
    } else {
      overall = 'unhealthy'
    }

    return { overall, services }
  }

  /**
   * Execute a complete user journey for testing
   */
  async executeUserJourney(userAddress: Address): Promise<{
    success: boolean
    steps: Array<{
      step: string
      success: boolean
      error?: string
      data?: any
    }>
  }> {
    const steps: Array<{ step: string; success: boolean; error?: string; data?: any }> = []

    try {
      // Step 1: Register user
      const registerResult = await this.authController.registerUser(
        'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM',
        userAddress
      )
      steps.push({
        step: 'Register User',
        success: registerResult.success,
        error: registerResult.error,
        data: registerResult.data
      })

      if (!registerResult.success) {
        return { success: false, steps }
      }

      // Step 2: Complete progress
      for (let chapter = 1; chapter <= 3; chapter++) {
        for (let lesson = 1; lesson <= 5; lesson++) {
          const progressResult = await this.progressTracker.markLessonComplete(
            userAddress,
            chapter,
            lesson
          )
          
          if (!progressResult.success) {
            steps.push({
              step: `Complete Chapter ${chapter} Lesson ${lesson}`,
              success: false,
              error: progressResult.error
            })
            return { success: false, steps }
          }
        }
      }

      steps.push({
        step: 'Complete Progress',
        success: true,
        data: { chapters: 3, lessons: 15 }
      })

      // Step 3: Mint badges
      for (let i = 1; i <= 6; i++) {
        const badgeResult = await this.badgeTracker.mintBadge(
          userAddress,
          'ChapterCompletion' as any,
          i,
          `Badge ${i}`
        )
        
        if (!badgeResult.success) {
          steps.push({
            step: `Mint Badge ${i}`,
            success: false,
            error: badgeResult.error
          })
          return { success: false, steps }
        }
      }

      steps.push({
        step: 'Mint Badges',
        success: true,
        data: { badgeCount: 6 }
      })

      // Step 4: Mint graduation NFT
      const nftResult = await this.graduationNFT.mintGraduationNFT(userAddress)
      steps.push({
        step: 'Mint Graduation NFT',
        success: nftResult.success,
        error: nftResult.error,
        data: nftResult.data
      })

      return {
        success: nftResult.success,
        steps
      }
    } catch (error) {
      steps.push({
        step: 'Unexpected Error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return { success: false, steps }
    }
  }
}

/**
 * Create a new blockchain API client instance
 */
export function createBlockchainApiClient(config: Partial<ApiClientConfig> = {}): BlockchainApiClient {
  return new BlockchainApiClientImpl(config)
}

/**
 * Default client instance for convenience
 */
export const blockchainApiClient = createBlockchainApiClient({
  baseUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_API_URL || 'http://localhost:8080'
})
