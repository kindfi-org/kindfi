# Mock Blockchain Services Integration Guide

This comprehensive guide provides step-by-step instructions for integrating the Mock Blockchain Services into your application, covering both direct service usage and HTTP API client integration.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Service Setup and Configuration](#service-setup-and-configuration)
3. [React Hooks Integration](#react-hooks-integration)
4. [HTTP API Client Integration](#http-api-client-integration)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

## Quick Start

### 1. Basic Service Initialization

```typescript
import { MockBlockchainServiceFactory } from '~/lib/services/blockchain/mock-service-factory'

// Initialize services
const factory = MockBlockchainServiceFactory.getInstance({
  environment: 'development',
  autoInitialize: true,
  generateTestData: true,
})

const services = factory.getAllServices()
```

### 2. React Hook Usage

```tsx
import { useProgressTracker, useBadgeTracker, useGraduationNFT } from '~/hooks/blockchain'

function LearningComponent({ userId }: { userId: string }) {
  const { markLessonComplete, isLoading, error } = useProgressTracker()
  const { mintBadge } = useBadgeTracker()
  const { checkEligibility, mintGraduationNFT } = useGraduationNFT()

  const handleCompleteLesson = async () => {
    const result = await markLessonComplete(userId, 1, 1)
    if (result.success) {
      // Lesson completed successfully
      console.log('Lesson completed!')
    }
  }

  return (
    <button onClick={handleCompleteLesson} disabled={isLoading}>
      {isLoading ? 'Completing...' : 'Complete Lesson'}
    </button>
  )
}
```

### 3. HTTP API Client Usage

```typescript
import { createBlockchainApiClient } from '~/lib/clients/blockchain/blockchain-api-client'

// Initialize API client
const apiClient = createBlockchainApiClient({
  baseUrl: 'http://localhost:8080',
  timeout: 30000,
  retryAttempts: 3,
})

// Use the client
const result = await apiClient.progressTracker.markLessonComplete(userId, 1, 1)
```

## Service Setup and Configuration

### Environment Configuration

```typescript
// Development environment
const devConfig = {
  environment: 'development' as const,
  networkDelay: 100,        // Simulate network latency
  errorRate: 0.05,          // 5% error rate for testing
  enableLogging: true,      // Enable detailed logging
  generateTestData: true,   // Generate sample data
  autoInitialize: true,     // Auto-initialize services
}

// Testing environment
const testConfig = {
  environment: 'testing' as const,
  networkDelay: 0,          // No artificial delay
  errorRate: 0,             // No artificial errors
  enableLogging: false,     // Minimal logging
  generateTestData: false,  // Clean state
  autoInitialize: true,
}

// Production environment (using real blockchain)
const prodConfig = {
  environment: 'production' as const,
  networkDelay: 0,
  errorRate: 0,
  enableLogging: false,
  generateTestData: false,
  autoInitialize: false,    // Manual initialization
}
```

### Service Dependencies

```typescript
// Manual dependency setup (if needed)
const progressService = new MockProgressTrackerService(config)
const authService = new MockAuthControllerService(config)
const badgeService = new MockBadgeTrackerService(config)
const nftService = new MockGraduationNFTService(config)

// Set up dependencies
badgeService.setDependencies(progressService, authService)
nftService.setDependencies(progressService, badgeService)

// Initialize services
await badgeService.init(
  'GPROGRESS_TRACKER_ADDRESS',
  'GAUTH_CONTROLLER_ADDRESS',
  'GADMIN_ADDRESS'
)
await nftService.initialize(
  'GADMIN_ADDRESS',
  'GPROGRESS_TRACKER_ADDRESS',
  'GBADGE_TRACKER_ADDRESS'
)
```

## React Hooks Integration

### Context Provider Setup

```tsx
// app/providers.tsx
import { BlockchainProvider } from '~/contexts/blockchain-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BlockchainProvider>
      {children}
    </BlockchainProvider>
  )
}
```

### Component Integration Examples

#### Progress Tracking Component

```tsx
import { useProgressTracker } from '~/hooks/blockchain/use-progress-tracker'
import { LessonProgressCard } from '~/components/examples/blockchain/lesson-progress-card'

function ChapterView({ userId, chapterId }: { userId: string, chapterId: number }) {
  const { getUserProgress, isLoading } = useProgressTracker()
  const [progress, setProgress] = useState<number[]>([])

  useEffect(() => {
    const loadProgress = async () => {
      const userProgress = await getUserProgress(userId, chapterId)
      setProgress(userProgress)
    }
    loadProgress()
  }, [userId, chapterId])

  const lessons = [
    { id: 1, title: 'Introduction', description: 'Learn the basics' },
    { id: 2, title: 'Advanced Topics', description: 'Deep dive' },
    // ... more lessons
  ]

  return (
    <div className="space-y-4">
      {lessons.map((lesson) => (
        <LessonProgressCard
          key={lesson.id}
          userId={userId}
          chapterId={chapterId}
          lessonId={lesson.id}
          title={lesson.title}
          description={lesson.description}
          isUnlocked={lesson.id === 1 || progress.includes(lesson.id - 1)}
        />
      ))}
    </div>
  )
}
```

#### Graduation Dashboard

```tsx
import { GraduationDashboard } from '~/components/examples/blockchain/graduation-dashboard'

function StudentDashboard({ userId }: { userId: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <GraduationDashboard userId={userId} />
    </div>
  )
}
```

### Error Handling Patterns

```tsx
import { useResilientProgress } from '~/hooks/use-resilient-progress'
import { ErrorDisplay } from '~/lib/clients/blockchain/docs/error-display'

function ResilientComponent({ userId }: { userId: string }) {
  const {
    markLessonComplete,
    isOfflineMode,
    queuedActionsCount,
    error,
    isLoading
  } = useResilientProgress()

  return (
    <div>
      {isOfflineMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800">
            Working offline. {queuedActionsCount} actions queued for sync.
          </p>
        </div>
      )}

      {error && (
        <ErrorDisplay
          error={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {/* Your component content */}
    </div>
  )
}
```

## HTTP API Client Integration

### Client Configuration

```typescript
// lib/api-client.ts
import { createBlockchainApiClient } from '~/lib/clients/blockchain/blockchain-api-client'

export const blockchainApi = createBlockchainApiClient({
  baseUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_API_URL || 'http://localhost:8080',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableLogging: process.env.NODE_ENV === 'development',
  headers: {
    'X-Client-Version': '1.0.0',
    'X-Environment': process.env.NODE_ENV,
  }
})
```

### API Integration Examples

#### Server-Side API Routes

```typescript
// app/api/progress/route.ts
import { blockchainApi } from '~/lib/api-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, chapterId, lessonId } = await request.json()
    
    const result = await blockchainApi.progressTracker.markLessonComplete(
      userId,
      chapterId,
      lessonId
    )

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### Client-Side Integration

```tsx
// components/api-integrated-component.tsx
import { useState } from 'react'
import { blockchainApi } from '~/lib/api-client'

function ApiIntegratedComponent({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await blockchainApi.progressTracker.markLessonComplete(
        userId, 1, 1
      )

      if (!result.success) {
        setError(result.error || 'Operation failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {error && <div className="text-red-600">{error}</div>}
      <button onClick={handleAction} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Complete Lesson'}
      </button>
    </div>
  )
}
```

### Event Streaming Integration

```typescript
// hooks/use-api-events.ts
import { useEffect, useState } from 'react'
import { blockchainApi } from '~/lib/api-client'

export function useApiProgressEvents(userId?: string) {
  const [events, setEvents] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const unsubscribe = blockchainApi.progressTracker.subscribeToProgressEvents(
      (event) => {
        setEvents(prev => [...prev, event])
      },
      userId
    )

    setIsConnected(true)

    return () => {
      unsubscribe()
      setIsConnected(false)
    }
  }, [userId])

  return { events, isConnected }
}
```

## Production Deployment

### Docker Container Setup

```dockerfile
# Dockerfile for blockchain API server
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
```

### Environment Variables

```bash
# .env.production
NEXT_PUBLIC_BLOCKCHAIN_API_URL=https://api.yourapp.com/blockchain
BLOCKCHAIN_ENVIRONMENT=production
BLOCKCHAIN_ENABLE_LOGGING=false
BLOCKCHAIN_TIMEOUT=60000
BLOCKCHAIN_RETRY_ATTEMPTS=5
```

### Health Monitoring

```typescript
// lib/health-monitor.ts
import { blockchainApi } from '~/lib/api-client'

export class HealthMonitor {
  private interval: NodeJS.Timeout | null = null

  start() {
    this.interval = setInterval(async () => {
      try {
        const health = await blockchainApi.system.getHealth()
        if (!health.success) {
          console.error('Blockchain API health check failed:', health.error)
          // Trigger alerts, fallback mechanisms, etc.
        }
      } catch (error) {
        console.error('Health check error:', error)
      }
    }, 30000) // Check every 30 seconds
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
}
```

### Performance Optimization

```typescript
// lib/optimized-client.ts
import { createBlockchainApiClient } from '~/lib/clients/blockchain/blockchain-api-client'

export const optimizedBlockchainApi = createBlockchainApiClient({
  baseUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_API_URL!,
  timeout: 60000,
  retryAttempts: 5,
  retryDelay: 2000,
  enableLogging: false,
  headers: {
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
  }
})

// Add performance monitoring
optimizedBlockchainApi.addEventListener('REQUEST_SUCCESS', (event) => {
  if (event.duration && event.duration > 5000) {
    console.warn(`Slow API request: ${event.endpoint} took ${event.duration}ms`)
  }
})

optimizedBlockchainApi.addEventListener('REQUEST_ERROR', (event) => {
  console.error(`API request failed: ${event.endpoint}`, event.error)
  // Send to monitoring service
})
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Service Initialization Errors

**Problem**: Services fail to initialize or dependencies are not set up correctly.

**Solution**:
```typescript
// Check service status
const factory = MockBlockchainServiceFactory.getInstance()
const status = factory.getSystemStatus()
console.log('System status:', status)

// Verify dependencies
const services = factory.getAllServices()
const badgeStatus = services.badgeTracker.getBadgeTrackerStatus()
const nftStatus = services.graduationNFT.getGraduationNFTStatus()

if (!badgeStatus.isInitialized) {
  console.error('Badge tracker not initialized')
}
if (!nftStatus.isInitialized) {
  console.error('Graduation NFT service not initialized')
}
```

#### 2. HTTP API Connection Issues

**Problem**: Cannot connect to Docker container or API endpoints.

**Solution**:
```typescript
// Test connection
const testConnection = async () => {
  try {
    const health = await blockchainApi.system.getHealth()
    console.log('API Health:', health)
  } catch (error) {
    console.error('Connection failed:', error)

    // Check if Docker container is running
    // docker ps | grep blockchain-api

    // Check if port is accessible
    // curl http://localhost:8080/system/health
  }
}
```

#### 3. Authentication Errors

**Problem**: Users not properly registered or authenticated.

**Solution**:
```typescript
// Verify user authentication
const checkUserAuth = async (userId: string) => {
  const isAuth = await services.authController.is_authenticated_user(userId)
  if (!isAuth) {
    // Register user
    await services.authController.register_user(
      'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM',
      userId
    )
  }
}
```

#### 4. Progress/Badge Validation Errors

**Problem**: Badge minting fails due to insufficient progress.

**Solution**:
```typescript
// Validate requirements before minting
const validateBadgeRequirements = async (userId: string, badgeType: string, refId: number) => {
  const { validateBadgeRequirements } = useBadgeTracker()

  const validation = await validateBadgeRequirements(userId, badgeType as any, refId)

  if (!validation.canMint) {
    console.log('Cannot mint badge:', validation.reason)
    console.log('Missing requirements:', validation.requirements)
    return false
  }

  return true
}
```

#### 5. Memory and Performance Issues

**Problem**: Services consume too much memory or respond slowly.

**Solution**:
```typescript
// Monitor and clear caches
const monitorPerformance = () => {
  const metrics = blockchainApi.getMetrics()

  if (metrics.averageResponseTime > 5000) {
    console.warn('High response times detected')
    blockchainApi.clearCache()
  }

  // Reset services if needed
  if (metrics.failedRequests > 10) {
    factory.resetAllServices()
  }
}
```

### Debug Mode

```typescript
// Enable debug mode
const debugFactory = MockBlockchainServiceFactory.getInstance({
  environment: 'development',
  enableLogging: true,
  networkDelay: 0,
  errorRate: 0,
})

// Add event listeners for debugging
const services = debugFactory.getAllServices()
services.progressTracker.on('lesson_completed', (data) => {
  console.log('DEBUG: Lesson completed', data)
})

services.badgeTracker.on('badge_minted', (data) => {
  console.log('DEBUG: Badge minted', data)
})
```

## Best Practices

### 1. Error Handling

```typescript
// Always handle errors gracefully
const safeApiCall = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage: string
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    console.error(errorMessage, error)
    // Log to monitoring service
    return fallback
  }
}

// Usage
const progress = await safeApiCall(
  () => blockchainApi.progressTracker.getUserProgress(userId, chapterId),
  [],
  'Failed to fetch user progress'
)
```

### 2. Caching Strategy

```typescript
// Implement smart caching
const useSmartCache = () => {
  const [cache, setCache] = useState(new Map())

  const getCached = <T>(key: string, fetcher: () => Promise<T>, ttl = 300000): Promise<T> => {
    const cached = cache.get(key)

    if (cached && Date.now() - cached.timestamp < ttl) {
      return Promise.resolve(cached.data)
    }

    return fetcher().then(data => {
      setCache(prev => new Map(prev).set(key, {
        data,
        timestamp: Date.now()
      }))
      return data
    })
  }

  return { getCached }
}
```

### 3. Event-Driven Architecture

```typescript
// Use events for loose coupling
class BlockchainEventBus {
  private listeners = new Map<string, Set<Function>>()

  on(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error('Event listener error:', error)
        }
      })
    }
  }
}

export const blockchainEvents = new BlockchainEventBus()
```

### 4. Testing Strategy

```typescript
// Create test utilities
export const createTestEnvironment = () => {
  const factory = MockBlockchainServiceFactory.getInstance({
    environment: 'testing',
    autoInitialize: true,
  })

  const cleanup = () => {
    factory.resetAllServices()
  }

  const createTestUser = async () => {
    const userId = `GTEST${Date.now()}ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJ`
    const services = factory.getAllServices()

    await services.authController.register_user(
      'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM',
      userId
    )

    return userId
  }

  return { factory, cleanup, createTestUser }
}
```

### 5. Production Monitoring

```typescript
// Implement comprehensive monitoring
class BlockchainMonitor {
  private metrics = {
    requests: 0,
    errors: 0,
    lastError: null as Error | null,
    uptime: Date.now()
  }

  trackRequest() {
    this.metrics.requests++
  }

  trackError(error: Error) {
    this.metrics.errors++
    this.metrics.lastError = error

    // Send to monitoring service
    this.sendToMonitoring({
      type: 'error',
      error: error.message,
      timestamp: Date.now()
    })
  }

  getHealthReport() {
    return {
      ...this.metrics,
      errorRate: this.metrics.requests > 0 ? this.metrics.errors / this.metrics.requests : 0,
      uptime: Date.now() - this.metrics.uptime
    }
  }

  private sendToMonitoring(data: any) {
    // Implementation depends on your monitoring service
    console.log('Monitoring:', data)
  }
}

export const blockchainMonitor = new BlockchainMonitor()
```

### 6. Security Considerations

```typescript
// Validate user inputs
const validateAddress = (address: string): boolean => {
  return /^G[A-Z0-9]{55}$/.test(address)
}

const validateChapterLesson = (chapterId: number, lessonId: number): boolean => {
  return chapterId > 0 && chapterId <= 10 && lessonId > 0 && lessonId <= 20
}

// Rate limiting for API calls
class RateLimiter {
  private requests = new Map<string, number[]>()

  isAllowed(key: string, limit = 100, window = 60000): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []

    // Remove old requests
    const validRequests = requests.filter(time => now - time < window)

    if (validRequests.length >= limit) {
      return false
    }

    validRequests.push(now)
    this.requests.set(key, validRequests)
    return true
  }
}
```

---

## Summary

This integration guide provides comprehensive examples for integrating Mock Blockchain Services into your application. Key takeaways:

1. **Start Simple**: Begin with basic service initialization and gradually add complexity
2. **Handle Errors**: Always implement proper error handling and fallback mechanisms
3. **Monitor Performance**: Track metrics and optimize based on real usage patterns
4. **Test Thoroughly**: Use the testing utilities and patterns provided
5. **Plan for Production**: Consider scalability, monitoring, and security from the start

For additional support and examples, refer to the component examples in the `/components/examples/blockchain/` directory.
```
