# Error Handling Examples

This document provides comprehensive examples for handling errors in blockchain service integrations, including graceful degradation, user-friendly messaging, retry mechanisms, and monitoring.

## Table of Contents

1. [Graceful Degradation](#graceful-degradation)
2. [User-Friendly Error Messages](#user-friendly-error-messages)
3. [Retry Mechanisms](#retry-mechanisms)
4. [Circuit Breaker Pattern](#circuit-breaker-pattern)
5. [Logging and Monitoring](#logging-and-monitoring)
6. [Recovery Strategies](#recovery-strategies)

## Graceful Degradation

### Service Unavailability Handling

```typescript
// hooks/use-resilient-progress.ts
import { useProgressTracker } from '~/hooks/blockchain/use-progress-tracker'
import { useState, useCallback } from 'react'

export function useResilientProgress() {
  const { markLessonComplete, getUserProgress, error, isLoading } = useProgressTracker()
  const [offlineQueue, setOfflineQueue] = useState<Array<{
    action: 'markComplete'
    params: any[]
    timestamp: number
  }>>([])
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  const markLessonCompleteResilient = useCallback(async (
    user: string,
    chapterId: number,
    lessonId: number
  ) => {
    try {
      const result = await markLessonComplete(user, chapterId, lessonId)
      
      if (result.success) {
        // Process any queued offline actions
        await processOfflineQueue()
        return result
      } else {
        // Queue for offline processing
        queueOfflineAction('markComplete', [user, chapterId, lessonId])
        return { success: true, offline: true }
      }
    } catch (error) {
      // Service unavailable - queue action
      queueOfflineAction('markComplete', [user, chapterId, lessonId])
      setIsOfflineMode(true)
      
      return { 
        success: true, 
        offline: true,
        message: 'Progress saved locally. Will sync when connection is restored.'
      }
    }
  }, [markLessonComplete])

  const queueOfflineAction = useCallback((action: string, params: any[]) => {
    setOfflineQueue(prev => [...prev, {
      action: action as 'markComplete',
      params,
      timestamp: Date.now()
    }])
  }, [])

  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return

    const results = []
    for (const queuedAction of offlineQueue) {
      try {
        if (queuedAction.action === 'markComplete') {
          const [user, chapterId, lessonId] = queuedAction.params
          const result = await markLessonComplete(user, chapterId, lessonId)
          results.push({ ...queuedAction, result })
        }
      } catch (error) {
        console.error('Failed to process queued action:', error)
        // Keep failed actions in queue
        continue
      }
    }

    // Remove successfully processed actions
    setOfflineQueue(prev => 
      prev.filter(action => 
        !results.some(result => 
          result.timestamp === action.timestamp && result.result?.success
        )
      )
    )

    if (offlineQueue.length === 0) {
      setIsOfflineMode(false)
    }
  }, [offlineQueue, markLessonComplete])

  return {
    markLessonComplete: markLessonCompleteResilient,
    getUserProgress,
    isOfflineMode,
    queuedActionsCount: offlineQueue.length,
    processOfflineQueue,
    error,
    isLoading
  }
}
```

### Fallback UI Components

```typescript
// components/fallback-progress-display.tsx
interface FallbackProgressDisplayProps {
  user: string
  chapterId: number
  error?: string
}

export function FallbackProgressDisplay({ user, chapterId, error }: FallbackProgressDisplayProps) {
  const [localProgress, setLocalProgress] = useState<number[]>([])

  useEffect(() => {
    // Load from localStorage as fallback
    const stored = localStorage.getItem(`progress_${user}_${chapterId}`)
    if (stored) {
      try {
        setLocalProgress(JSON.parse(stored))
      } catch (e) {
        console.warn('Failed to parse stored progress')
      }
    }
  }, [user, chapterId])

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Service Temporarily Unavailable
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Showing last known progress. Your data is safe and will sync when service is restored.
            </p>
          </div>
        </div>
        
        {localProgress.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-yellow-700">
              Last known progress: {localProgress.length} lessons completed
            </p>
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded ${
                    localProgress.includes(i + 1)
                      ? 'bg-yellow-400'
                      : 'bg-yellow-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
```

## User-Friendly Error Messages

### Error Message Mapping

```typescript
// utils/error-messages.ts
import { ProgressError, BadgeError, NFTError } from '~/lib/types/blockchain/contract-interfaces.types'

export const ERROR_MESSAGES = {
  // Progress errors
  [ProgressError.LessonNotFound]: {
    title: 'Lesson Not Found',
    message: 'This lesson doesn\'t exist. Please check the chapter and lesson numbers.',
    action: 'Go back and select a valid lesson',
    severity: 'error' as const
  },
  [ProgressError.ChapterNotFound]: {
    title: 'Chapter Not Available',
    message: 'This chapter is not yet available. Complete previous chapters first.',
    action: 'Return to available chapters',
    severity: 'warning' as const
  },
  [ProgressError.AlreadyCompleted]: {
    title: 'Already Completed',
    message: 'You\'ve already completed this lesson. Great job!',
    action: 'Continue to next lesson',
    severity: 'info' as const
  },

  // Badge errors
  [BadgeError.NotInitialized]: {
    title: 'Service Initializing',
    message: 'The badge system is starting up. Please wait a moment.',
    action: 'Try again in a few seconds',
    severity: 'warning' as const
  },
  [BadgeError.BadgeAlreadyExists]: {
    title: 'Badge Already Earned',
    message: 'You\'ve already earned this badge! Check your collection.',
    action: 'View your badges',
    severity: 'info' as const
  },
  [BadgeError.InsufficientProgress]: {
    title: 'More Progress Needed',
    message: 'Complete more lessons to unlock this badge.',
    action: 'Continue learning',
    severity: 'warning' as const
  },

  // NFT errors
  [NFTError.InsufficientProgress]: {
    title: 'Keep Learning!',
    message: 'You need to complete at least 80% of the course to earn your graduation NFT.',
    action: 'Continue your learning journey',
    severity: 'info' as const
  },
  [NFTError.InvalidBadgeCount]: {
    title: 'Earn More Badges',
    message: 'You need at least 5 badges to qualify for graduation.',
    action: 'Complete more achievements',
    severity: 'info' as const
  },
  [NFTError.AlreadyMinted]: {
    title: 'Already Graduated!',
    message: 'Congratulations! You\'ve already earned your graduation NFT.',
    action: 'View your NFT',
    severity: 'success' as const
  },

  // Generic errors
  'NETWORK_ERROR': {
    title: 'Connection Problem',
    message: 'Unable to connect to the service. Check your internet connection.',
    action: 'Try again',
    severity: 'error' as const
  },
  'TIMEOUT_ERROR': {
    title: 'Request Timed Out',
    message: 'The request took too long. The service might be busy.',
    action: 'Try again',
    severity: 'warning' as const
  },
  'UNKNOWN_ERROR': {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Our team has been notified.',
    action: 'Try again later',
    severity: 'error' as const
  }
} as const

export function getErrorMessage(error: string | Error): {
  title: string
  message: string
  action: string
  severity: 'error' | 'warning' | 'info' | 'success'
} {
  const errorKey = typeof error === 'string' ? error : error.message
  
  return ERROR_MESSAGES[errorKey as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.UNKNOWN_ERROR
}
```

### Error Display Component

```typescript
// components/error-display.tsx
interface ErrorDisplayProps {
  error: string | Error | null
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function ErrorDisplay({ error, onRetry, onDismiss, className }: ErrorDisplayProps) {
  if (!error) return null

  const errorInfo = getErrorMessage(error)
  
  const severityStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  }

  const iconMap = {
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
    success: CheckCircleIcon
  }

  const Icon = iconMap[errorInfo.severity]

  return (
    <div className={`border rounded-lg p-4 ${severityStyles[errorInfo.severity]} ${className}`}>
      <div className="flex items-start">
        <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium">{errorInfo.title}</h3>
          <p className="mt-1 text-sm opacity-90">{errorInfo.message}</p>
          
          <div className="mt-3 flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm font-medium underline hover:no-underline"
              >
                {errorInfo.action}
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm font-medium underline hover:no-underline opacity-75"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Retry Mechanisms

### Exponential Backoff Hook

```typescript
// hooks/use-retry.ts
interface RetryConfig {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
}

export function useRetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  config: Partial<RetryConfig> = {}
) {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2
  } = config

  const [isRetrying, setIsRetrying] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)

  const executeWithRetry = useCallback(async (...args: T): Promise<R> => {
    setIsRetrying(true)
    setAttemptCount(0)

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      setAttemptCount(attempt)

      try {
        const result = await fn(...args)
        setIsRetrying(false)
        return result
      } catch (error) {
        if (attempt === maxAttempts) {
          setIsRetrying(false)
          throw error
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt - 1),
          maxDelay
        )

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    setIsRetrying(false)
    throw new Error('Max retry attempts exceeded')
  }, [fn, maxAttempts, initialDelay, maxDelay, backoffMultiplier])

  return {
    executeWithRetry,
    isRetrying,
    attemptCount
  }
}
```

### Smart Retry Component

```typescript
// components/smart-retry-wrapper.tsx
interface SmartRetryWrapperProps {
  children: ReactNode
  onError?: (error: Error, attempt: number) => void
  maxRetries?: number
  retryCondition?: (error: Error) => boolean
}

export function SmartRetryWrapper({ 
  children, 
  onError, 
  maxRetries = 3,
  retryCondition = () => true 
}: SmartRetryWrapperProps) {
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) return

    setIsRetrying(true)
    setRetryCount(prev => prev + 1)

    try {
      // Trigger re-render of children
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
    } catch (newError) {
      const err = newError as Error
      if (retryCondition(err)) {
        onError?.(err, retryCount + 1)
        setError(err)
      }
    } finally {
      setIsRetrying(false)
    }
  }, [retryCount, maxRetries, retryCondition, onError])

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={retryCount < maxRetries ? handleRetry : undefined}
        onDismiss={() => setError(null)}
      />
    )
  }

  if (isRetrying) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2">Retrying... (Attempt {retryCount + 1})</span>
      </div>
    )
  }

  return (
    <ErrorBoundary
      onError={(error) => {
        if (retryCondition(error)) {
          setError(error)
          onError?.(error, retryCount)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```
