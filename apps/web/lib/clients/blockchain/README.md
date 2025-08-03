# Mock Blockchain Services - Complete Integration Package

This package provides a comprehensive mock blockchain implementation for the KindFi learning platform, including both direct service integration and HTTP API client support.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 2. Basic Setup

```typescript
import { MockBlockchainServiceFactory } from '~/lib/services/blockchain/mock-service-factory'
import { useProgressTracker, useBadgeTracker, useGraduationNFT } from '~/hooks/blockchain'

// Initialize services
const factory = MockBlockchainServiceFactory.getInstance({
  environment: 'development',
  autoInitialize: true,
})

// Use in React components
function MyComponent() {
  const { markLessonComplete, isLoading } = useProgressTracker()
  
  const handleComplete = async () => {
    const result = await markLessonComplete(userId, chapterId, lessonId)
    if (result.success) {
      console.log('Lesson completed!')
    }
  }
  
  return <button onClick={handleComplete}>Complete Lesson</button>
}
```

### 3. HTTP API Client Setup

```typescript
import { createBlockchainApiClient } from '~/lib/clients/blockchain/blockchain-api-client'

const apiClient = createBlockchainApiClient({
  baseUrl: 'http://localhost:8080',
  timeout: 30000,
  retryAttempts: 3,
})

// Use the API client
const result = await apiClient.progressTracker.markLessonComplete(userId, 1, 1)
```

## 📁 Package Structure

```
lib/clients/blockchain/
├── README.md                           # This file
├── types.ts                           # TypeScript type definitions
├── base-client.ts                     # Base HTTP client with retry logic
├── progress-tracker-client.ts         # Progress tracking API client
├── badge-tracker-client.ts           # Badge management API client
├── blockchain-api-client.ts           # Main API client combining all services
├── docs/
│   ├── integration-guide.md           # Comprehensive integration guide
│   ├── usage-patterns.md              # Common usage patterns and examples
│   └── error-handling-examples.md     # Error handling strategies
└── __tests__/                        # Test files

hooks/blockchain/
├── use-progress-tracker.ts            # Progress tracking React hook
├── use-badge-tracker.ts               # Badge management React hook
├── use-graduation-nft.ts              # Graduation NFT React hook
└── use-blockchain-auth.ts             # Authentication React hook

components/examples/blockchain/
├── lesson-progress-card.tsx           # Individual lesson component
├── graduation-dashboard.tsx           # Complete graduation dashboard
├── api-client-demo.tsx               # HTTP API client demonstration
└── advanced-learning-platform.tsx    # Comprehensive integration example
```

## 🎯 Core Features

### Mock Blockchain Services
- **Progress Tracker**: Lesson and chapter completion tracking
- **Badge Tracker**: Achievement badge minting and management
- **Graduation NFT**: Soulbound graduation certificates
- **Auth Controller**: User authentication and authorization
- **Service Factory**: Centralized service management and configuration

### React Hooks
- **useProgressTracker**: Progress tracking with caching and events
- **useBadgeTracker**: Badge operations with validation
- **useGraduationNFT**: NFT minting with eligibility checking
- **useBlockchainAuth**: User authentication management

### HTTP API Clients
- **BaseHttpClient**: Advanced HTTP client with retry, caching, and monitoring
- **Service-specific clients**: Dedicated clients for each blockchain service
- **Unified API client**: Single interface for all blockchain operations

### Advanced Features
- **Error Handling**: Comprehensive error recovery and user-friendly messages
- **Offline Support**: Queue management for offline operations
- **Real-time Events**: WebSocket-like event streaming
- **Performance Monitoring**: Metrics collection and analysis
- **Circuit Breaker**: Resilience patterns for service failures
- **Optimistic Updates**: Immediate UI feedback with rollback support

## 🔧 Configuration Options

### Service Factory Configuration

```typescript
interface ServiceFactoryConfig {
  environment: 'development' | 'testing' | 'demo' | 'production'
  networkDelay?: number          // Simulate network latency (ms)
  errorRate?: number             // Artificial error rate (0-1)
  enableLogging?: boolean        // Enable detailed logging
  generateTestData?: boolean     // Generate sample data
  autoInitialize?: boolean       // Auto-initialize services
  testUserCount?: number         // Number of test users to generate
}
```

### HTTP Client Configuration

```typescript
interface ApiClientConfig {
  baseUrl: string               // API server URL
  timeout?: number              // Request timeout (ms)
  retryAttempts?: number        // Number of retry attempts
  retryDelay?: number           // Initial retry delay (ms)
  enableLogging?: boolean       // Enable request logging
  headers?: Record<string, string>  // Default headers
}
```

## 📚 Usage Examples

### Basic Progress Tracking

```typescript
import { useProgressTracker } from '~/hooks/blockchain/use-progress-tracker'

function LessonComponent({ userId, chapterId, lessonId }) {
  const { markLessonComplete, getUserProgress, isLoading, error } = useProgressTracker()
  
  const handleComplete = async () => {
    const result = await markLessonComplete(userId, chapterId, lessonId)
    if (result.success) {
      // Lesson completed successfully
      const progress = await getUserProgress(userId, chapterId)
      console.log('Chapter progress:', progress)
    }
  }
  
  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleComplete} disabled={isLoading}>
        {isLoading ? 'Completing...' : 'Complete Lesson'}
      </button>
    </div>
  )
}
```

### Badge Management

```typescript
import { useBadgeTracker } from '~/hooks/blockchain/use-badge-tracker'

function BadgeComponent({ userId }) {
  const { mintBadge, getUserBadges, validateBadgeRequirements } = useBadgeTracker()
  
  const handleMintBadge = async () => {
    // Validate requirements first
    const validation = await validateBadgeRequirements(
      userId, 'ChapterCompletion', 1
    )
    
    if (validation.canMint) {
      const result = await mintBadge(
        userId, 'ChapterCompletion', 1, 'Completed Chapter 1'
      )
      
      if (result.success) {
        console.log('Badge minted:', result.data)
      }
    } else {
      console.log('Requirements not met:', validation.requirements)
    }
  }
  
  return <button onClick={handleMintBadge}>Mint Badge</button>
}
```

### Graduation NFT

```typescript
import { useGraduationNFT } from '~/hooks/blockchain/use-graduation-nft'

function GraduationComponent({ userId }) {
  const { 
    checkEligibility, 
    mintGraduationNFT, 
    hasGraduationNFT,
    isLoading 
  } = useGraduationNFT()
  
  const [eligibility, setEligibility] = useState(null)
  
  useEffect(() => {
    const checkStatus = async () => {
      const hasNFT = await hasGraduationNFT(userId)
      if (!hasNFT) {
        const eligible = await checkEligibility(userId)
        setEligibility(eligible)
      }
    }
    checkStatus()
  }, [userId])
  
  const handleMintNFT = async () => {
    if (eligibility?.eligible) {
      const result = await mintGraduationNFT(userId)
      if (result.success) {
        console.log('Graduation NFT minted!')
      }
    }
  }
  
  return (
    <div>
      {eligibility?.eligible ? (
        <button onClick={handleMintNFT} disabled={isLoading}>
          Mint Graduation NFT
        </button>
      ) : (
        <div>Requirements not met: {eligibility?.reason}</div>
      )}
    </div>
  )
}
```

### HTTP API Integration

```typescript
import { createBlockchainApiClient } from '~/lib/clients/blockchain/blockchain-api-client'

const apiClient = createBlockchainApiClient({
  baseUrl: process.env.NEXT_PUBLIC_BLOCKCHAIN_API_URL,
  timeout: 30000,
  retryAttempts: 3,
})

// Complete user journey
async function completeUserJourney(userId: string) {
  try {
    // Register user
    await apiClient.authController.registerUser(adminUser, userId)
    
    // Complete lessons
    for (let chapter = 1; chapter <= 3; chapter++) {
      for (let lesson = 1; lesson <= 5; lesson++) {
        await apiClient.progressTracker.markLessonComplete(userId, chapter, lesson)
      }
    }
    
    // Mint badges
    for (let i = 1; i <= 6; i++) {
      await apiClient.badgeTracker.mintBadge(
        userId, 'ChapterCompletion', i, `Chapter ${i}`
      )
    }
    
    // Mint graduation NFT
    const nftResult = await apiClient.graduationNFT.mintGraduationNFT(userId)
    
    return nftResult.success
  } catch (error) {
    console.error('User journey failed:', error)
    return false
  }
}
```

## 🧪 Testing

### Unit Testing

```typescript
import { MockBlockchainServiceFactory } from '~/lib/services/blockchain/mock-service-factory'

describe('Progress Tracking', () => {
  let factory: MockBlockchainServiceFactory
  
  beforeEach(() => {
    factory = MockBlockchainServiceFactory.getInstance({
      environment: 'testing',
      autoInitialize: true,
    })
    factory.resetAllServices()
  })
  
  test('should complete lesson successfully', async () => {
    const services = factory.getAllServices()
    const result = await services.progressTracker.mark_lesson_complete(
      'GTEST123...', 1, 1
    )
    
    expect(result.success).toBe(true)
  })
})
```

### Integration Testing

```typescript
import { createBlockchainApiClient } from '~/lib/clients/blockchain/blockchain-api-client'

describe('API Integration', () => {
  const client = createBlockchainApiClient({
    baseUrl: 'http://localhost:8080'
  })
  
  test('should complete full user journey', async () => {
    const results = await client.executeUserJourney('GTEST123...')
    expect(results.success).toBe(true)
  })
})
```

## 🚀 Production Deployment

### Docker Setup

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

### Environment Configuration

```bash
# Production environment variables
NEXT_PUBLIC_BLOCKCHAIN_API_URL=https://api.yourapp.com/blockchain
BLOCKCHAIN_ENVIRONMENT=production
BLOCKCHAIN_ENABLE_LOGGING=false
BLOCKCHAIN_TIMEOUT=60000
BLOCKCHAIN_RETRY_ATTEMPTS=5
```

## 📖 Documentation

- **[Integration Guide](./docs/integration-guide.md)**: Step-by-step integration instructions
- **[Usage Patterns](./docs/usage-patterns.md)**: Common patterns and best practices
- **[Error Handling](./docs/error-handling-examples.md)**: Comprehensive error handling strategies

## 🤝 Contributing

1. Follow the existing TypeScript patterns and code style
2. Add comprehensive JSDoc documentation
3. Include unit tests for new features
4. Update integration examples as needed
5. Follow the error handling patterns established in the codebase

## 📄 License

This package is part of the KindFi learning platform and follows the project's licensing terms.

---

For more detailed examples and advanced usage patterns, see the [Integration Guide](./docs/integration-guide.md) and explore the example components in `/components/examples/blockchain/`.
