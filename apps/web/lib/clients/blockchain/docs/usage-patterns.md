# Blockchain Services Usage Patterns

This document provides comprehensive examples and best practices for integrating with the Mock Blockchain Services.

## Table of Contents

1. [Service Initialization](#service-initialization)
2. [Dependency Injection Patterns](#dependency-injection-patterns)
3. [Event Handling and Subscriptions](#event-handling-and-subscriptions)
4. [Testing Strategies](#testing-strategies)
5. [Error Handling Best Practices](#error-handling-best-practices)
6. [Performance Optimization](#performance-optimization)

## Service Initialization

### Basic Initialization

```typescript
import { MockBlockchainServiceFactory } from '~/lib/services/blockchain/mock-service-factory'

// Initialize with default configuration
const factory = MockBlockchainServiceFactory.getInstance({
  environment: 'development',
  autoInitialize: true,
})

const services = factory.getAllServices()
```

### Environment-Specific Configuration

```typescript
// Development environment
const devFactory = MockBlockchainServiceFactory.getInstance({
  environment: 'development',
  networkDelay: 100,
  errorRate: 0.05,
  enableLogging: true,
  generateTestData: true,
})

// Production environment (using real blockchain)
const prodFactory = MockBlockchainServiceFactory.getInstance({
  environment: 'production',
  networkDelay: 0,
  errorRate: 0,
  enableLogging: false,
  generateTestData: false,
})

// Testing environment
const testFactory = MockBlockchainServiceFactory.getInstance({
  environment: 'testing',
  networkDelay: 0,
  errorRate: 0,
  enableLogging: false,
  autoInitialize: true,
})
```

### HTTP Client Initialization

```typescript
import { createBlockchainApiClient } from '~/lib/clients/blockchain/blockchain-api-client'

// Basic HTTP client
const apiClient = createBlockchainApiClient({
  baseUrl: 'http://localhost:8080',
  timeout: 30000,
  retryAttempts: 3,
})

// Production HTTP client with advanced configuration
const prodApiClient = createBlockchainApiClient({
  baseUrl: process.env.BLOCKCHAIN_API_URL,
  timeout: 60000,
  retryAttempts: 5,
  retryDelay: 2000,
  enableLogging: true,
  headers: {
    'Authorization': `Bearer ${process.env.API_TOKEN}`,
    'X-Client-Version': '1.0.0',
  }
})
```

## Dependency Injection Patterns

### React Context Pattern

```typescript
// contexts/blockchain-context.tsx
import React, { createContext, useContext, ReactNode } from 'react'
import { MockBlockchainServiceFactory } from '~/lib/services/blockchain/mock-service-factory'
import { createBlockchainApiClient } from '~/lib/clients/blockchain/blockchain-api-client'

interface BlockchainContextType {
  services: ReturnType<typeof MockBlockchainServiceFactory.prototype.getAllServices>
  apiClient: ReturnType<typeof createBlockchainApiClient>
  isReady: boolean
}

const BlockchainContext = createContext<BlockchainContextType | null>(null)

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  
  const factory = useMemo(() => 
    MockBlockchainServiceFactory.getInstance({
      environment: process.env.NODE_ENV === 'production' ? 'demo' : 'development',
      autoInitialize: true,
    }), []
  )
  
  const services = useMemo(() => factory.getAllServices(), [factory])
  
  const apiClient = useMemo(() => 
    createBlockchainApiClient({
      baseUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_API_URL || 'http://localhost:8080'
    }), []
  )

  useEffect(() => {
    // Initialize services and mark as ready
    const initializeServices = async () => {
      try {
        // Perform any async initialization
        await factory.initializeServices()
        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize blockchain services:', error)
      }
    }

    initializeServices()
  }, [factory])

  return (
    <BlockchainContext.Provider value={{ services, apiClient, isReady }}>
      {children}
    </BlockchainContext.Provider>
  )
}

export function useBlockchainContext() {
  const context = useContext(BlockchainContext)
  if (!context) {
    throw new Error('useBlockchainContext must be used within a BlockchainProvider')
  }
  return context
}
```

### Service Locator Pattern

```typescript
// services/blockchain-service-locator.ts
class BlockchainServiceLocator {
  private static instance: BlockchainServiceLocator
  private factory: MockBlockchainServiceFactory | null = null
  private apiClient: ReturnType<typeof createBlockchainApiClient> | null = null

  private constructor() {}

  static getInstance(): BlockchainServiceLocator {
    if (!BlockchainServiceLocator.instance) {
      BlockchainServiceLocator.instance = new BlockchainServiceLocator()
    }
    return BlockchainServiceLocator.instance
  }

  initialize(config: {
    environment: 'development' | 'testing' | 'demo' | 'production'
    apiUrl?: string
  }) {
    this.factory = MockBlockchainServiceFactory.getInstance({
      environment: config.environment,
      autoInitialize: true,
    })

    this.apiClient = createBlockchainApiClient({
      baseUrl: config.apiUrl || 'http://localhost:8080'
    })
  }

  getServices() {
    if (!this.factory) {
      throw new Error('BlockchainServiceLocator not initialized')
    }
    return this.factory.getAllServices()
  }

  getApiClient() {
    if (!this.apiClient) {
      throw new Error('BlockchainServiceLocator not initialized')
    }
    return this.apiClient
  }
}

export const blockchainServiceLocator = BlockchainServiceLocator.getInstance()
```

## Event Handling and Subscriptions

### Progress Event Subscriptions

```typescript
import { useProgressTracker } from '~/hooks/blockchain/use-progress-tracker'

function ProgressEventHandler() {
  const { subscribeToEvents } = useProgressTracker()

  useEffect(() => {
    const unsubscribe = subscribeToEvents(
      // Lesson completed handler
      (data) => {
        console.log('Lesson completed:', data)
        // Update UI, show notification, etc.
        toast.success(`Lesson ${data.lesson_id} completed!`)
      },
      // Chapter completed handler
      (data) => {
        console.log('Chapter completed:', data)
        // Trigger badge minting, show celebration, etc.
        confetti()
        toast.success(`Chapter ${data.chapter_id} completed! 🎉`)
      }
    )

    return unsubscribe
  }, [subscribeToEvents])

  return null // This is an event handler component
}
```

### Cross-Service Event Coordination

```typescript
// hooks/use-blockchain-events.ts
export function useBlockchainEvents() {
  const { subscribeToEvents: subscribeToProgress } = useProgressTracker()
  const { subscribeToEvents: subscribeToBadges } = useBadgeTracker()
  const [events, setEvents] = useState<Array<{ type: string, data: any, timestamp: number }>>([])

  useEffect(() => {
    const progressUnsubscribe = subscribeToProgress(
      (lessonData) => {
        setEvents(prev => [...prev, {
          type: 'lesson_completed',
          data: lessonData,
          timestamp: Date.now()
        }])
      },
      (chapterData) => {
        setEvents(prev => [...prev, {
          type: 'chapter_completed',
          data: chapterData,
          timestamp: Date.now()
        }])
      }
    )

    const badgeUnsubscribe = subscribeToBadges((badgeData) => {
      setEvents(prev => [...prev, {
        type: 'badge_minted',
        data: badgeData,
        timestamp: Date.now()
      }])
    })

    return () => {
      progressUnsubscribe()
      badgeUnsubscribe()
    }
  }, [subscribeToProgress, subscribeToBadges])

  return { events }
}
```

### HTTP Event Streaming

```typescript
// For HTTP API clients
function useProgressEventStream(userAddress?: string) {
  const [events, setEvents] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const apiClient = createBlockchainApiClient()
    
    const unsubscribe = apiClient.progressTracker.subscribeToProgressEvents(
      (event) => {
        setEvents(prev => [...prev, event])
      },
      userAddress
    )

    setIsConnected(true)

    return () => {
      unsubscribe()
      setIsConnected(false)
    }
  }, [userAddress])

  return { events, isConnected }
}
```

## Testing Strategies

### Unit Testing with Mock Services

```typescript
// __tests__/progress-component.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MockBlockchainServiceFactory } from '~/lib/services/blockchain/mock-service-factory'
import { ProgressComponent } from '../progress-component'

describe('ProgressComponent', () => {
  let factory: MockBlockchainServiceFactory

  beforeEach(() => {
    factory = MockBlockchainServiceFactory.getInstance({
      environment: 'testing',
      autoInitialize: true,
    })
    factory.resetAllServices()
  })

  afterEach(() => {
    factory.resetAllServices()
  })

  it('should mark lesson as complete', async () => {
    const testUser = 'GTEST1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM'
    
    render(<ProgressComponent userId={testUser} />)
    
    const completeButton = screen.getByText('Complete Lesson')
    fireEvent.click(completeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Lesson completed!')).toBeInTheDocument()
    })
  })
})
```

### Integration Testing

```typescript
// __tests__/integration/user-journey.test.tsx
describe('User Journey Integration', () => {
  it('should complete full graduation flow', async () => {
    const factory = MockBlockchainServiceFactory.getInstance({
      environment: 'testing',
      autoInitialize: true,
    })
    
    const services = factory.getAllServices()
    const testUser = 'GTEST1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM'
    const adminUser = 'GADMIN1ABCDEFGHIJKLMNOPQRSTUVWXYZ234567890ABCDEFGHIJKLM'

    // Register user
    await services.authController.register_user(adminUser, testUser)
    
    // Complete progress
    for (let chapter = 1; chapter <= 3; chapter++) {
      for (let lesson = 1; lesson <= 5; lesson++) {
        const result = await services.progressTracker.mark_lesson_complete(
          testUser, chapter, lesson
        )
        expect(result.success).toBe(true)
      }
    }

    // Mint badges
    for (let i = 1; i <= 6; i++) {
      const result = await services.badgeTracker.mint_badge(
        testUser, 'ChapterCompletion', i, `Badge ${i}`
      )
      expect(result.success).toBe(true)
    }

    // Mint graduation NFT
    const nftResult = await services.graduationNFT.mint_graduation_nft(testUser)
    expect(nftResult.success).toBe(true)
    expect(nftResult.data?.owner).toBe(testUser)
  })
})
```

### HTTP Client Testing

```typescript
// __tests__/api-client.test.ts
import { createBlockchainApiClient } from '~/lib/clients/blockchain/blockchain-api-client'

// Mock fetch for testing
global.fetch = jest.fn()

describe('Blockchain API Client', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('should handle successful API calls', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [1, 2, 3] })
    })

    const client = createBlockchainApiClient({
      baseUrl: 'http://test-api'
    })

    const result = await client.progressTracker.getUserProgress('GTEST123...', 1)
    
    expect(result.success).toBe(true)
    expect(result.data).toEqual([1, 2, 3])
  })

  it('should handle API errors with retry', async () => {
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      })

    const client = createBlockchainApiClient({
      baseUrl: 'http://test-api',
      retryAttempts: 3
    })

    const result = await client.progressTracker.getUserProgress('GTEST123...', 1)
    
    expect(result.success).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(3)
  })
})
```
