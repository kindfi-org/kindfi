/**
 * Base HTTP client for blockchain API with retry logic, error handling, and monitoring
 */

import type {
  ApiClientConfig,
  ApiResponse,
  HttpClientError,
  HttpErrorType,
  RequestOptions,
  RetryConfig,
  ApiMetrics,
  ApiEvent,
  ApiEventType,
  ApiLogger,
  CachedResponse
} from './types'

/**
 * Default configuration for the API client
 */
const DEFAULT_CONFIG: Required<ApiClientConfig> = {
  baseUrl: 'http://localhost:8080',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableLogging: true,
  headers: {
    'Content-Type': 'application/json',
  }
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: 3,
  delay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000
}

/**
 * Simple console logger implementation
 */
class ConsoleLogger implements ApiLogger {
  constructor(private enabled: boolean = true) {}

  debug(message: string, data?: any): void {
    if (this.enabled && process.env.NODE_ENV === 'development') {
      console.debug(`[API Debug] ${message}`, data)
    }
  }

  info(message: string, data?: any): void {
    if (this.enabled) {
      console.info(`[API Info] ${message}`, data)
    }
  }

  warn(message: string, data?: any): void {
    if (this.enabled) {
      console.warn(`[API Warning] ${message}`, data)
    }
  }

  error(message: string, error?: Error, data?: any): void {
    if (this.enabled) {
      console.error(`[API Error] ${message}`, error, data)
    }
  }
}

/**
 * Base HTTP client with advanced features
 */
export class BaseHttpClient {
  private config: Required<ApiClientConfig>
  private metrics: ApiMetrics
  private logger: ApiLogger
  private cache: Map<string, CachedResponse<any>>
  private eventListeners: Map<ApiEventType, Set<(event: ApiEvent) => void>>

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.logger = new ConsoleLogger(this.config.enableLogging)
    this.cache = new Map()
    this.eventListeners = new Map()
    
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: 0,
      errorsByType: {} as Record<HttpErrorType, number>
    }

    this.logger.info('BaseHttpClient initialized', { baseUrl: this.config.baseUrl })
  }

  /**
   * Make an HTTP request with retry logic and error handling
   */
  async request<T>(
    endpoint: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now()
    const fullUrl = `${this.config.baseUrl}${endpoint}`
    
    this.metrics.totalRequests++
    this.emitEvent({
      type: ApiEventType.RequestStart,
      timestamp: startTime,
      endpoint
    })

    // Check cache first
    const cacheKey = this.generateCacheKey(endpoint, options.body)
    const cachedResponse = this.getFromCache<T>(cacheKey)
    if (cachedResponse) {
      this.logger.debug('Cache hit', { endpoint, cacheKey })
      return { success: true, data: cachedResponse }
    }

    const retryConfig = { ...DEFAULT_RETRY_CONFIG, retries: options.retries }
    let lastError: HttpClientError | null = null

    for (let attempt = 1; attempt <= retryConfig.attempts; attempt++) {
      try {
        const response = await this.makeRequest<T>(fullUrl, options, attempt)
        
        // Cache successful responses
        if (response.success && response.data) {
          this.setCache(cacheKey, response.data)
        }

        const duration = Date.now() - startTime
        this.updateMetrics(true, duration)
        
        this.emitEvent({
          type: ApiEventType.RequestSuccess,
          timestamp: Date.now(),
          endpoint,
          duration
        })

        return response
      } catch (error) {
        lastError = error instanceof HttpClientError ? error : this.createHttpError(error)
        
        this.logger.warn(`Request attempt ${attempt} failed`, { 
          endpoint, 
          error: lastError.message,
          attempt 
        })

        if (attempt < retryConfig.attempts && this.shouldRetry(lastError)) {
          const delay = this.calculateRetryDelay(attempt, retryConfig)
          
          this.emitEvent({
            type: ApiEventType.RequestRetry,
            timestamp: Date.now(),
            endpoint,
            error: lastError,
            attempt
          })

          await this.sleep(delay)
          continue
        }

        break
      }
    }

    // All attempts failed
    const duration = Date.now() - startTime
    this.updateMetrics(false, duration)
    this.updateErrorMetrics(lastError!.type)

    this.emitEvent({
      type: ApiEventType.RequestError,
      timestamp: Date.now(),
      endpoint,
      duration,
      error: lastError!
    })

    this.logger.error('Request failed after all retries', lastError!, { endpoint })
    
    return {
      success: false,
      error: lastError!.message
    }
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest<T>(
    url: string,
    options: RequestInit & RequestOptions,
    attempt: number
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.config.headers,
          ...options.headers
        },
        signal: options.signal || controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw this.createHttpErrorFromResponse(response)
      }

      const data = await response.json()
      return { success: true, data, timestamp: Date.now() }
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof HttpClientError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new HttpClientError(
            HttpErrorType.TimeoutError,
            `Request timeout after ${options.timeout || this.config.timeout}ms`
          )
        }
        
        if (error.message.includes('fetch')) {
          throw new HttpClientError(
            HttpErrorType.NetworkError,
            `Network error: ${error.message}`
          )
        }
      }

      throw this.createHttpError(error)
    }
  }

  /**
   * Create HTTP error from response
   */
  private createHttpErrorFromResponse(response: Response): HttpClientError {
    const statusCode = response.status
    
    if (statusCode >= 400 && statusCode < 500) {
      if (statusCode === 401) {
        return new HttpClientError(
          HttpErrorType.AuthenticationError,
          'Authentication required',
          statusCode,
          response
        )
      }
      
      if (statusCode === 429) {
        return new HttpClientError(
          HttpErrorType.RateLimitError,
          'Rate limit exceeded',
          statusCode,
          response
        )
      }

      return new HttpClientError(
        HttpErrorType.ClientError,
        `Client error: ${response.statusText}`,
        statusCode,
        response
      )
    }

    if (statusCode >= 500) {
      return new HttpClientError(
        HttpErrorType.ServerError,
        `Server error: ${response.statusText}`,
        statusCode,
        response
      )
    }

    return new HttpClientError(
      HttpErrorType.UnknownError,
      `Unknown error: ${response.statusText}`,
      statusCode,
      response
    )
  }

  /**
   * Create generic HTTP error
   */
  private createHttpError(error: any): HttpClientError {
    return new HttpClientError(
      HttpErrorType.UnknownError,
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: HttpClientError): boolean {
    // Don't retry client errors (4xx) except for specific cases
    if (error.type === HttpErrorType.ClientError && error.statusCode !== 429) {
      return false
    }

    // Don't retry authentication errors
    if (error.type === HttpErrorType.AuthenticationError) {
      return false
    }

    // Retry network errors, timeouts, server errors, and rate limits
    return [
      HttpErrorType.NetworkError,
      HttpErrorType.TimeoutError,
      HttpErrorType.ServerError,
      HttpErrorType.RateLimitError
    ].includes(error.type)
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, config: RetryConfig): number {
    const baseDelay = config.delay
    const multiplier = config.backoffMultiplier || 2
    const maxDelay = config.maxDelay || 10000
    
    const delay = baseDelay * Math.pow(multiplier, attempt - 1)
    return Math.min(delay, maxDelay)
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Update request metrics
   */
  private updateMetrics(success: boolean, duration: number): void {
    if (success) {
      this.metrics.successfulRequests++
    } else {
      this.metrics.failedRequests++
    }

    // Update average response time
    const totalRequests = this.metrics.successfulRequests + this.metrics.failedRequests
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (totalRequests - 1) + duration) / totalRequests

    this.metrics.lastRequestTime = Date.now()
  }

  /**
   * Update error metrics
   */
  private updateErrorMetrics(errorType: HttpErrorType): void {
    this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(endpoint: string, body?: any): string {
    const bodyHash = body ? JSON.stringify(body) : ''
    return `${endpoint}:${bodyHash}`
  }

  /**
   * Get from cache
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    // Check if cache entry is still valid
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Set cache
   */
  private setCache<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })

    // Simple cache size management
    if (this.cache.size > 1000) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: ApiEvent): void {
    const listeners = this.eventListeners.get(event.type)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event)
        } catch (error) {
          this.logger.error('Event listener error', error as Error)
        }
      })
    }
  }

  /**
   * Add event listener
   */
  addEventListener(type: ApiEventType, listener: (event: ApiEvent) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set())
    }
    this.eventListeners.get(type)!.add(listener)
  }

  /**
   * Remove event listener
   */
  removeEventListener(type: ApiEventType, listener: (event: ApiEvent) => void): void {
    const listeners = this.eventListeners.get(type)
    if (listeners) {
      listeners.delete(listener)
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): ApiMetrics {
    return { ...this.metrics }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
    this.logger.info('Cache cleared')
  }

  /**
   * Destroy client and cleanup resources
   */
  destroy(): void {
    this.clearCache()
    this.eventListeners.clear()
    this.logger.info('BaseHttpClient destroyed')
  }
}
