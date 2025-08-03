/**
 * Type definitions for blockchain HTTP API clients
 */

import type { 
  Address, 
  Badge, 
  BadgeType, 
  GraduationNFT, 
  UserOverallProgress,
  Result,
  ProgressError,
  BadgeError,
  NFTError
} from '~/lib/types/blockchain/contract-interfaces.types'

/**
 * Base API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp?: number
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseUrl: string
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
  enableLogging?: boolean
  headers?: Record<string, string>
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  attempts: number
  delay: number
  backoffMultiplier?: number
  maxDelay?: number
}

/**
 * Progress Tracker API endpoints
 */
export interface ProgressTrackerApi {
  markLessonComplete(user: Address, chapterId: number, lessonId: number): Promise<ApiResponse<void>>
  getUserProgress(user: Address, chapterId: number): Promise<ApiResponse<number[]>>
  getOverallProgress(user: Address): Promise<ApiResponse<UserOverallProgress>>
  isChapterComplete(user: Address, chapterId: number): Promise<ApiResponse<boolean>>
  getChapterConfig(chapterId: number): Promise<ApiResponse<any>>
}

/**
 * Badge Tracker API endpoints
 */
export interface BadgeTrackerApi {
  mintBadge(user: Address, badgeType: BadgeType, referenceId: number, description: string): Promise<ApiResponse<Badge>>
  getUserBadges(user: Address): Promise<ApiResponse<Badge[]>>
  getBadgesByType(badgeType: BadgeType, referenceId: number): Promise<ApiResponse<Badge[]>>
  hasBadge(user: Address, badgeType: BadgeType, referenceId: number): Promise<ApiResponse<boolean>>
  getBadgeStats(): Promise<ApiResponse<any>>
}

/**
 * Auth Controller API endpoints
 */
export interface AuthControllerApi {
  isAuthenticated(address: Address): Promise<ApiResponse<boolean>>
  registerUser(admin: Address, user: Address): Promise<ApiResponse<void>>
  getAuthenticatedUsers(): Promise<ApiResponse<Address[]>>
  getAuthStats(): Promise<ApiResponse<any>>
  bulkRegisterUsers(admin: Address, users: Address[]): Promise<ApiResponse<{ successful: Address[], failed: Array<{ address: Address, reason: string }> }>>
}

/**
 * Graduation NFT API endpoints
 */
export interface GraduationNFTApi {
  mintGraduationNFT(recipient: Address): Promise<ApiResponse<GraduationNFT>>
  getGraduationNFT(user: Address): Promise<ApiResponse<GraduationNFT | null>>
  hasGraduationNFT(user: Address): Promise<ApiResponse<boolean>>
  getGraduationStats(): Promise<ApiResponse<any>>
  getAllHolders(): Promise<ApiResponse<Address[]>>
}

/**
 * System API endpoints
 */
export interface SystemApi {
  getStatus(): Promise<ApiResponse<any>>
  reset(): Promise<ApiResponse<void>>
  getHealth(): Promise<ApiResponse<{ status: string, uptime: number }>>
}

/**
 * HTTP client error types
 */
export enum HttpErrorType {
  NetworkError = 'NETWORK_ERROR',
  TimeoutError = 'TIMEOUT_ERROR',
  ServerError = 'SERVER_ERROR',
  ClientError = 'CLIENT_ERROR',
  ValidationError = 'VALIDATION_ERROR',
  AuthenticationError = 'AUTHENTICATION_ERROR',
  RateLimitError = 'RATE_LIMIT_ERROR',
  UnknownError = 'UNKNOWN_ERROR'
}

/**
 * HTTP client error class
 */
export class HttpClientError extends Error {
  constructor(
    public type: HttpErrorType,
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'HttpClientError'
  }
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  timeout?: number
  retries?: number
  headers?: Record<string, string>
  signal?: AbortSignal
}

/**
 * Circuit breaker state
 */
export enum CircuitBreakerState {
  Closed = 'CLOSED',
  Open = 'OPEN',
  HalfOpen = 'HALF_OPEN'
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number
  recoveryTimeout: number
  monitoringPeriod: number
}

/**
 * Metrics for monitoring API performance
 */
export interface ApiMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  lastRequestTime: number
  errorsByType: Record<HttpErrorType, number>
}

/**
 * Event types for API client events
 */
export enum ApiEventType {
  RequestStart = 'REQUEST_START',
  RequestSuccess = 'REQUEST_SUCCESS',
  RequestError = 'REQUEST_ERROR',
  RequestRetry = 'REQUEST_RETRY',
  CircuitBreakerOpen = 'CIRCUIT_BREAKER_OPEN',
  CircuitBreakerClose = 'CIRCUIT_BREAKER_CLOSE'
}

/**
 * API event data
 */
export interface ApiEvent {
  type: ApiEventType
  timestamp: number
  endpoint: string
  duration?: number
  error?: HttpClientError
  attempt?: number
}

/**
 * Logging interface for API clients
 */
export interface ApiLogger {
  debug(message: string, data?: any): void
  info(message: string, data?: any): void
  warn(message: string, data?: any): void
  error(message: string, error?: Error, data?: any): void
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean
  ttl: number // Time to live in milliseconds
  maxSize: number
  keyGenerator?: (endpoint: string, params: any) => string
}

/**
 * Cached response
 */
export interface CachedResponse<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  maxRequests: number
  windowMs: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

/**
 * Health check configuration
 */
export interface HealthCheckConfig {
  enabled: boolean
  interval: number // Interval in milliseconds
  timeout: number
  endpoint: string
}

/**
 * Complete blockchain API client interface
 */
export interface BlockchainApiClient {
  progressTracker: ProgressTrackerApi
  badgeTracker: BadgeTrackerApi
  authController: AuthControllerApi
  graduationNFT: GraduationNFTApi
  system: SystemApi
  
  // Client management
  getMetrics(): ApiMetrics
  clearCache(): void
  destroy(): void
}
