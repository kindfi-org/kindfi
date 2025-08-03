# Blockchain Services Usage Patterns

This document provides comprehensive examples and patterns for integrating with the Mock Blockchain Services.

## Table of Contents

1. [Service Initialization](#service-initialization)
2. [React Hook Patterns](#react-hook-patterns)
3. [API Client Patterns](#api-client-patterns)
4. [Error Handling Patterns](#error-handling-patterns)
5. [Event Handling](#event-handling)
6. [Testing Strategies](#testing-strategies)
7. [Performance Optimization](#performance-optimization)

## Service Initialization

### Direct Service Usage

```typescript
import { MockBlockchainServiceFactory } from '~/lib/services/blockchain/mock-service-factory'

// Initialize factory with configuration
const factory = MockBlockchainServiceFactory.getInstance({
  environment: 'development',
  networkDelay: 100,
  errorRate: 0.01,
  enableLogging: true,
  autoInitialize: true
})

// Get individual services
const progressService = factory.getProgressTracker()
const badgeService = factory.getBadgeTracker()
const authService = factory.getAuthController()
const nftService = factory.getGraduationNFT()
```

### HTTP Client Usage

```typescript
import { createBlockchainApiClient } from '~/lib/clients/blockchain/blockchain-api-client'

// Create client with configuration
const client = createBlockchainApiClient({
  baseUrl: 'http://localhost:8080',
  timeout: 30000,
  retryAttempts: 3,
  enableLogging: true
})

// Use the client
const result = await client.progressTracker.markLessonComplete(userAddress, 1, 1)
```

## React Hook Patterns

### Basic Hook Usage

```tsx
import { useProgressTracker } from '~/hooks/blockchain/use-progress-tracker'

function LessonComponent({ userId, chapterId, lessonId }) {
  const {
    markLessonComplete,
    getUserProgress,
    isLoading,
    error,
    clearError
  } = useProgressTracker()

  const handleCompleteLesson = async () => {
    clearError()
    const result = await markLessonComplete(userId, chapterId, lessonId)
    
    if (result.success) {
      // Handle success
      console.log('Lesson completed!')
    } else {
      // Error is automatically set in hook state
      console.error('Failed to complete lesson')
    }
  }

  return (
    <div>
      {error && (
        <div className="error-message">
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      
      <button 
        onClick={handleCompleteLesson} 
        disabled={isLoading}
        className={isLoading ? 'loading' : ''}
      >
        {isLoading ? 'Completing...' : 'Complete Lesson'}
      </button>
    </div>
  )
}
```

### Combined Hook Usage

```tsx
import { useProgressTracker } from '~/hooks/blockchain/use-progress-tracker'
import { useBadgeTracker } from '~/hooks/blockchain/use-badge-tracker'
import { useGraduationNFT } from '~/hooks/blockchain/use-graduation-nft'

function UserDashboard({ userId }) {
  const progress = useProgressTracker()
  const badges = useBadgeTracker()
  const graduation = useGraduationNFT()

  const [userProgress, setUserProgress] = useState(null)
  const [userBadges, setUserBadges] = useState([])
  const [eligibility, setEligibility] = useState(null)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load data in parallel
        const [progressData, badgeData, eligibilityData] = await Promise.all([
          progress.getOverallProgress(userId),
          badges.getUserBadges(userId),
          graduation.checkEligibility(userId)
        ])

        setUserProgress(progressData)
        setUserBadges(badgeData)
        setEligibility(eligibilityData)
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    }

    loadUserData()
  }, [userId])

  const handleGraduate = async () => {
    if (eligibility?.eligible) {
      const result = await graduation.mintGraduationNFT(userId)
      if (result.success) {
        // Refresh eligibility
        const newEligibility = await graduation.checkEligibility(userId)
        setEligibility(newEligibility)
      }
    }
  }

  return (
    <div className="user-dashboard">
      <div className="progress-section">
        <h2>Progress</h2>
        {userProgress && (
          <div>
            <p>Completed Chapters: {userProgress.completedChapters}</p>
            <p>Overall Progress: {userProgress.overallPercentage}%</p>
          </div>
        )}
      </div>

      <div className="badges-section">
        <h2>Badges ({userBadges.length})</h2>
        <div className="badge-grid">
          {userBadges.map(badge => (
            <div key={`${badge.badge_type}-${badge.reference_id}`} className="badge">
              <h3>{badge.badge_type}</h3>
              <p>{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="graduation-section">
        <h2>Graduation</h2>
        {eligibility && (
          <div>
            <p>Status: {eligibility.eligible ? 'Eligible' : 'Not Eligible'}</p>
            <p>Reason: {eligibility.reason}</p>
            
            {eligibility.eligible && (
              <button onClick={handleGraduate}>
                Mint Graduation NFT
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

## API Client Patterns

### Basic API Usage

```typescript
import { blockchainApiClient } from '~/lib/clients/blockchain/blockchain-api-client'

async function completeUserJourney(userAddress: string) {
  try {
    // Register user
    const registerResult = await blockchainApiClient.authController.registerUser(
      'GADMIN_ADDRESS',
      userAddress
    )
    
    if (!registerResult.success) {
      throw new Error(`Registration failed: ${registerResult.error}`)
    }

    // Complete lessons
    for (let chapter = 1; chapter <= 3; chapter++) {
      for (let lesson = 1; lesson <= 5; lesson++) {
        const result = await blockchainApiClient.progressTracker.markLessonComplete(
          userAddress,
          chapter,
          lesson
        )
        
        if (!result.success) {
          throw new Error(`Failed to complete lesson ${chapter}-${lesson}: ${result.error}`)
        }
      }
    }

    // Mint badges
    for (let i = 1; i <= 6; i++) {
      const result = await blockchainApiClient.badgeTracker.mintBadge(
        userAddress,
        'ChapterCompletion',
        i,
        `Completed Chapter ${i}`
      )
      
      if (!result.success) {
        throw new Error(`Failed to mint badge ${i}: ${result.error}`)
      }
    }

    // Mint graduation NFT
    const nftResult = await blockchainApiClient.graduationNFT.mintGraduationNFT(userAddress)
    
    if (!nftResult.success) {
      throw new Error(`Failed to mint NFT: ${nftResult.error}`)
    }

    return nftResult.data
  } catch (error) {
    console.error('User journey failed:', error)
    throw error
  }
}
```

### Batch Operations

```typescript
async function batchProcessUsers(userAddresses: string[]) {
  const results = {
    successful: [],
    failed: []
  }

  // Process in chunks to avoid overwhelming the server
  const chunkSize = 10
  for (let i = 0; i < userAddresses.length; i += chunkSize) {
    const chunk = userAddresses.slice(i, i + chunkSize)
    
    const chunkResults = await Promise.allSettled(
      chunk.map(address => completeUserJourney(address))
    )

    chunkResults.forEach((result, index) => {
      const address = chunk[index]
      if (result.status === 'fulfilled') {
        results.successful.push({ address, nft: result.value })
      } else {
        results.failed.push({ address, error: result.reason })
      }
    })

    // Add delay between chunks
    if (i + chunkSize < userAddresses.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return results
}
```

## Error Handling Patterns

### Graceful Degradation

```typescript
import { HttpErrorType } from '~/lib/clients/blockchain/types'

async function robustDataFetching(userId: string) {
  const fallbackData = {
    progress: { completedChapters: 0, overallPercentage: 0 },
    badges: [],
    hasNFT: false
  }

  try {
    // Try to fetch from API
    const [progress, badges, hasNFT] = await Promise.allSettled([
      blockchainApiClient.progressTracker.getOverallProgress(userId),
      blockchainApiClient.badgeTracker.getUserBadges(userId),
      blockchainApiClient.graduationNFT.hasGraduationNFT(userId)
    ])

    return {
      progress: progress.status === 'fulfilled' && progress.value.success 
        ? progress.value.data 
        : fallbackData.progress,
      badges: badges.status === 'fulfilled' && badges.value.success 
        ? badges.value.data 
        : fallbackData.badges,
      hasNFT: hasNFT.status === 'fulfilled' && hasNFT.value.success 
        ? hasNFT.value.data 
        : fallbackData.hasNFT
    }
  } catch (error) {
    console.warn('API unavailable, using fallback data:', error)
    return fallbackData
  }
}
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private threshold = 5,
    private timeout = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
    }
  }
}

// Usage
const circuitBreaker = new CircuitBreaker()

async function protectedApiCall(userId: string) {
  return circuitBreaker.execute(() => 
    blockchainApiClient.progressTracker.getOverallProgress(userId)
  )
}
```

## Event Handling

### Real-time Updates

```typescript
function useRealtimeProgress(userId: string) {
  const [progress, setProgress] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Subscribe to progress events
    const unsubscribe = blockchainApiClient.progressTracker.subscribeToProgressEvents(
      (event) => {
        if (event.user === userId) {
          // Update local state based on event
          setProgress(prev => ({
            ...prev,
            // Update based on event type
          }))
        }
      },
      userId
    )

    setIsConnected(true)

    return () => {
      unsubscribe()
      setIsConnected(false)
    }
  }, [userId])

  return { progress, isConnected }
}
```

## Testing Strategies

### Unit Testing with Mocks

```typescript
import { jest } from '@jest/globals'
import { MockBlockchainServiceFactory } from '~/lib/services/blockchain/mock-service-factory'

describe('User Journey', () => {
  let factory: MockBlockchainServiceFactory
  let services: any

  beforeEach(() => {
    factory = MockBlockchainServiceFactory.getInstance({
      environment: 'testing',
      networkDelay: 0,
      errorRate: 0
    })
    services = factory.getAllServices()
    factory.resetAllServices()
  })

  test('should complete user journey successfully', async () => {
    const userId = 'GTEST_USER_123'
    const adminId = 'GADMIN_123'

    // Register user
    await services.authController.register_user(adminId, userId)
    
    // Complete progress
    for (let chapter = 1; chapter <= 3; chapter++) {
      for (let lesson = 1; lesson <= 5; lesson++) {
        const result = await services.progressTracker.mark_lesson_complete(
          userId, chapter, lesson
        )
        expect(result.success).toBe(true)
      }
    }

    // Mint badges
    for (let i = 1; i <= 6; i++) {
      const result = await services.badgeTracker.mint_badge(
        userId, 'ChapterCompletion', i, `Badge ${i}`
      )
      expect(result.success).toBe(true)
    }

    // Mint NFT
    const nftResult = await services.graduationNFT.mint_graduation_nft(userId)
    expect(nftResult.success).toBe(true)
    expect(nftResult.data.owner).toBe(userId)
  })
})
```

### Integration Testing

```typescript
describe('API Integration', () => {
  let client: BlockchainApiClient

  beforeAll(() => {
    client = createBlockchainApiClient({
      baseUrl: 'http://localhost:8080'
    })
  })

  afterAll(() => {
    client.destroy()
  })

  test('should handle complete user journey via API', async () => {
    const userId = 'GTEST_API_USER_123'
    
    const journey = await client.executeUserJourney(userId)
    
    expect(journey.success).toBe(true)
    expect(journey.steps).toHaveLength(4)
    expect(journey.steps.every(step => step.success)).toBe(true)
  })
})
```

## Performance Optimization

### Caching Strategies

```typescript
class SmartCache {
  private cache = new Map()
  private ttl = new Map()

  set(key: string, value: any, ttlMs: number = 300000) {
    this.cache.set(key, value)
    this.ttl.set(key, Date.now() + ttlMs)
  }

  get(key: string) {
    if (!this.cache.has(key)) return null
    
    if (Date.now() > this.ttl.get(key)) {
      this.cache.delete(key)
      this.ttl.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  invalidate(pattern: string) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
        this.ttl.delete(key)
      }
    }
  }
}

// Usage in hooks
const cache = new SmartCache()

function useCachedProgress(userId: string) {
  const cacheKey = `progress_${userId}`
  
  const getCachedProgress = useCallback(async () => {
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const progress = await blockchainApiClient.progressTracker.getOverallProgress(userId)
    if (progress.success) {
      cache.set(cacheKey, progress.data, 60000) // 1 minute cache
    }
    
    return progress.data
  }, [userId, cacheKey])

  const invalidateCache = useCallback(() => {
    cache.invalidate(`progress_${userId}`)
  }, [userId])

  return { getCachedProgress, invalidateCache }
}
```

### Request Batching

```typescript
class RequestBatcher {
  private batches = new Map()
  private timers = new Map()

  batch<T>(
    key: string,
    request: () => Promise<T>,
    delay: number = 100
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(key)) {
        this.batches.set(key, [])
      }

      this.batches.get(key).push({ request, resolve, reject })

      if (!this.timers.has(key)) {
        this.timers.set(key, setTimeout(() => {
          this.executeBatch(key)
        }, delay))
      }
    })
  }

  private async executeBatch(key: string) {
    const batch = this.batches.get(key) || []
    this.batches.delete(key)
    this.timers.delete(key)

    // Execute all requests in parallel
    const results = await Promise.allSettled(
      batch.map(({ request }) => request())
    )

    // Resolve/reject individual promises
    results.forEach((result, index) => {
      const { resolve, reject } = batch[index]
      if (result.status === 'fulfilled') {
        resolve(result.value)
      } else {
        reject(result.reason)
      }
    })
  }
}

// Usage
const batcher = new RequestBatcher()

function batchedProgressRequest(userId: string, chapterId: number) {
  return batcher.batch(
    'progress_requests',
    () => blockchainApiClient.progressTracker.getUserProgress(userId, chapterId)
  )
}
```
