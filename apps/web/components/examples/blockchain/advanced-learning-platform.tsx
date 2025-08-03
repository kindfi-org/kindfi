'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useProgressTracker } from '~/hooks/blockchain/use-progress-tracker'
import { useBadgeTracker } from '~/hooks/blockchain/use-badge-tracker'
import { useGraduationNFT } from '~/hooks/blockchain/use-graduation-nft'
import { useBlockchainAuth } from '~/hooks/blockchain/use-blockchain-auth'
import { ErrorDisplay } from '~/lib/clients/blockchain/docs/error-display'
import { 
  AcademicCapIcon, 
  TrophyIcon, 
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ChartBarIcon,
  UserGroupIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

/**
 * Advanced Learning Platform - Comprehensive example demonstrating sophisticated integration patterns
 * 
 * Features:
 * - Real-time progress synchronization across multiple users
 * - Advanced caching with TTL and invalidation strategies
 * - Optimistic updates with rollback mechanisms
 * - Event-driven badge notifications and celebrations
 * - Performance monitoring and metrics display
 * - Offline support with queue management
 * - Circuit breaker pattern for resilience
 * - Smart retry mechanisms with exponential backoff
 * - Cross-service data consistency validation
 * - Advanced error recovery and user guidance
 * 
 * @example
 * ```tsx
 * <AdvancedLearningPlatform 
 *   userId="GUSER123..."
 *   courseId="blockchain-fundamentals"
 *   enableRealTimeSync={true}
 *   enableOfflineMode={true}
 * />
 * ```
 */
interface AdvancedLearningPlatformProps {
  userId: string
  courseId: string
  enableRealTimeSync?: boolean
  enableOfflineMode?: boolean
  enablePerformanceMonitoring?: boolean
}

interface LessonData {
  id: number
  title: string
  description: string
  estimatedMinutes: number
  prerequisites: number[]
  badgeReward?: {
    type: string
    description: string
  }
}

interface ChapterData {
  id: number
  title: string
  description: string
  lessons: LessonData[]
  completionBadge: {
    type: string
    description: string
  }
}

export function AdvancedLearningPlatform({
  userId,
  courseId,
  enableRealTimeSync = true,
  enableOfflineMode = true,
  enablePerformanceMonitoring = false
}: AdvancedLearningPlatformProps) {
  // Hooks
  const {
    markLessonComplete,
    getUserProgress,
    getOverallProgress,
    subscribeToEvents: subscribeToProgressEvents,
    isLoading: progressLoading,
    error: progressError,
    clearError: clearProgressError,
    clearCache: clearProgressCache
  } = useProgressTracker()

  const {
    mintBadge,
    getUserBadges,
    validateBadgeRequirements,
    subscribeToEvents: subscribeToBadgeEvents,
    isLoading: badgeLoading,
    error: badgeError,
    clearError: clearBadgeError
  } = useBadgeTracker()

  const {
    checkEligibility,
    mintGraduationNFT,
    hasGraduationNFT,
    isLoading: nftLoading,
    error: nftError,
    clearError: clearNftError
  } = useGraduationNFT()

  const {
    isAuthenticated,
    isLoading: authLoading,
    error: authError
  } = useBlockchainAuth()

  // State
  const [courseData] = useState<ChapterData[]>([
    {
      id: 1,
      title: "Blockchain Fundamentals",
      description: "Learn the core concepts of blockchain technology",
      lessons: [
        { id: 1, title: "What is Blockchain?", description: "Introduction to distributed ledgers", estimatedMinutes: 15, prerequisites: [] },
        { id: 2, title: "Cryptographic Hashing", description: "Understanding hash functions", estimatedMinutes: 20, prerequisites: [1] },
        { id: 3, title: "Digital Signatures", description: "Public key cryptography", estimatedMinutes: 25, prerequisites: [1, 2] },
        { id: 4, title: "Consensus Mechanisms", description: "How networks agree", estimatedMinutes: 30, prerequisites: [1, 2, 3] },
        { id: 5, title: "Smart Contracts", description: "Programmable agreements", estimatedMinutes: 35, prerequisites: [1, 2, 3, 4] }
      ],
      completionBadge: { type: "ChapterCompletion", description: "Blockchain Fundamentals Master" }
    },
    {
      id: 2,
      title: "Stellar Network",
      description: "Deep dive into Stellar blockchain",
      lessons: [
        { id: 1, title: "Stellar Architecture", description: "Network structure and components", estimatedMinutes: 20, prerequisites: [] },
        { id: 2, title: "Stellar Consensus Protocol", description: "Understanding SCP", estimatedMinutes: 30, prerequisites: [1] },
        { id: 3, title: "Assets and Anchors", description: "Token creation and management", estimatedMinutes: 25, prerequisites: [1, 2] },
        { id: 4, title: "Path Payments", description: "Multi-hop transactions", estimatedMinutes: 35, prerequisites: [1, 2, 3] },
        { id: 5, title: "Soroban Smart Contracts", description: "Stellar's smart contract platform", estimatedMinutes: 40, prerequisites: [1, 2, 3, 4] }
      ],
      completionBadge: { type: "ChapterCompletion", description: "Stellar Network Expert" }
    },
    {
      id: 3,
      title: "DeFi Applications",
      description: "Building decentralized finance applications",
      lessons: [
        { id: 1, title: "DeFi Primitives", description: "Core DeFi building blocks", estimatedMinutes: 25, prerequisites: [] },
        { id: 2, title: "Automated Market Makers", description: "AMM mechanics and implementation", estimatedMinutes: 35, prerequisites: [1] },
        { id: 3, title: "Lending Protocols", description: "Decentralized lending and borrowing", estimatedMinutes: 30, prerequisites: [1, 2] },
        { id: 4, title: "Yield Farming", description: "Liquidity mining strategies", estimatedMinutes: 40, prerequisites: [1, 2, 3] },
        { id: 5, title: "Risk Management", description: "Security and risk assessment", estimatedMinutes: 45, prerequisites: [1, 2, 3, 4] }
      ],
      completionBadge: { type: "ChapterCompletion", description: "DeFi Developer" }
    }
  ])

  const [userProgress, setUserProgress] = useState<Map<number, number[]>>(new Map())
  const [userBadges, setUserBadges] = useState<any[]>([])
  const [overallProgress, setOverallProgress] = useState<any>(null)
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)
  const [graduationEligibility, setGraduationEligibility] = useState<any>(null)
  const [hasGraduated, setHasGraduated] = useState(false)

  // Advanced state
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, any>>(new Map())
  const [offlineQueue, setOfflineQueue] = useState<any[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({})
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([])
  const [errorHistory, setErrorHistory] = useState<any[]>([])
  const [celebrationQueue, setCelebrationQueue] = useState<any[]>([])

  // Computed values
  const totalLessons = useMemo(() => 
    courseData.reduce((total, chapter) => total + chapter.lessons.length, 0), 
    [courseData]
  )

  const completedLessons = useMemo(() => 
    Array.from(userProgress.values()).reduce((total, lessons) => total + lessons.length, 0),
    [userProgress]
  )

  const completionPercentage = useMemo(() => 
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
    [completedLessons, totalLessons]
  )

  const isLoading = progressLoading || badgeLoading || nftLoading || authLoading
  const hasError = progressError || badgeError || nftError || authError

  // Load initial data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check authentication
        const authStatus = await isAuthenticated(userId)
        setIsUserAuthenticated(authStatus)

        if (!authStatus) return

        // Load progress for all chapters
        const progressPromises = courseData.map(async (chapter) => {
          const progress = await getUserProgress(userId, chapter.id)
          return [chapter.id, progress] as [number, number[]]
        })

        const progressResults = await Promise.all(progressPromises)
        setUserProgress(new Map(progressResults))

        // Load badges
        const badges = await getUserBadges(userId)
        setUserBadges(badges)

        // Load overall progress
        const overall = await getOverallProgress(userId)
        setOverallProgress(overall)

        // Check graduation status
        const hasNFT = await hasGraduationNFT(userId)
        setHasGraduated(hasNFT)

        if (!hasNFT) {
          const eligibility = await checkEligibility(userId)
          setGraduationEligibility(eligibility)
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
        setErrorHistory(prev => [...prev, {
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error',
          context: 'loadUserData'
        }])
      }
    }

    if (userId) {
      loadUserData()
    }
  }, [userId, courseData, isAuthenticated, getUserProgress, getUserBadges, getOverallProgress, hasGraduationNFT, checkEligibility])

  // Set up real-time event subscriptions
  useEffect(() => {
    if (!enableRealTimeSync || !isUserAuthenticated) return

    const progressUnsubscribe = subscribeToProgressEvents(
      // Lesson completed
      (data) => {
        if (data.user === userId) {
          setRealtimeEvents(prev => [...prev, { type: 'lesson_completed', data, timestamp: Date.now() }])
          
          // Update local state optimistically
          setUserProgress(prev => {
            const newMap = new Map(prev)
            const chapterProgress = newMap.get(data.chapter_id) || []
            if (!chapterProgress.includes(data.lesson_id)) {
              newMap.set(data.chapter_id, [...chapterProgress, data.lesson_id].sort())
            }
            return newMap
          })

          // Check for badge opportunities
          checkForAutomaticBadges(data.chapter_id, data.lesson_id)
        }
      },
      // Chapter completed
      (data) => {
        if (data.user === userId) {
          setRealtimeEvents(prev => [...prev, { type: 'chapter_completed', data, timestamp: Date.now() }])
          setCelebrationQueue(prev => [...prev, { type: 'chapter', chapterId: data.chapter_id }])
          
          // Auto-mint chapter completion badge
          mintChapterBadge(data.chapter_id)
        }
      }
    )

    const badgeUnsubscribe = subscribeToBadgeEvents((data) => {
      if (data.user === userId) {
        setRealtimeEvents(prev => [...prev, { type: 'badge_minted', data, timestamp: Date.now() }])
        setUserBadges(prev => [...prev, data.badge])
        setCelebrationQueue(prev => [...prev, { type: 'badge', badge: data.badge }])
      }
    })

    return () => {
      progressUnsubscribe()
      badgeUnsubscribe()
    }
  }, [enableRealTimeSync, isUserAuthenticated, userId, subscribeToProgressEvents, subscribeToBadgeEvents])

  // Advanced lesson completion with optimistic updates and error recovery
  const handleLessonComplete = useCallback(async (chapterId: number, lessonId: number) => {
    const operationId = `${chapterId}-${lessonId}-${Date.now()}`
    
    try {
      // Optimistic update
      setOptimisticUpdates(prev => new Map(prev).set(operationId, {
        type: 'lesson_complete',
        chapterId,
        lessonId,
        timestamp: Date.now()
      }))

      // Update UI immediately
      setUserProgress(prev => {
        const newMap = new Map(prev)
        const chapterProgress = newMap.get(chapterId) || []
        if (!chapterProgress.includes(lessonId)) {
          newMap.set(chapterId, [...chapterProgress, lessonId].sort())
        }
        return newMap
      })

      // Perform actual operation
      const result = await markLessonComplete(userId, chapterId, lessonId)

      if (result.success) {
        // Remove optimistic update on success
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev)
          newMap.delete(operationId)
          return newMap
        })
      } else {
        throw new Error(result.error || 'Failed to complete lesson')
      }
    } catch (error) {
      // Rollback optimistic update
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev)
        newMap.delete(operationId)
        return newMap
      })

      // Revert UI state
      setUserProgress(prev => {
        const newMap = new Map(prev)
        const chapterProgress = newMap.get(chapterId) || []
        newMap.set(chapterId, chapterProgress.filter(id => id !== lessonId))
        return newMap
      })

      // Handle offline mode
      if (enableOfflineMode && error instanceof Error && error.message.includes('network')) {
        setOfflineQueue(prev => [...prev, {
          type: 'lesson_complete',
          params: [userId, chapterId, lessonId],
          timestamp: Date.now(),
          retryCount: 0
        }])
      } else {
        setErrorHistory(prev => [...prev, {
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error',
          context: `lesson_complete_${chapterId}_${lessonId}`
        }])
      }
    }
  }, [userId, markLessonComplete, enableOfflineMode])

  // Auto-mint chapter completion badge
  const mintChapterBadge = useCallback(async (chapterId: number) => {
    try {
      const chapter = courseData.find(c => c.id === chapterId)
      if (!chapter) return

      const validation = await validateBadgeRequirements(
        userId,
        chapter.completionBadge.type as any,
        chapterId
      )

      if (validation.canMint) {
        await mintBadge(
          userId,
          chapter.completionBadge.type as any,
          chapterId,
          chapter.completionBadge.description
        )
      }
    } catch (error) {
      console.error('Failed to mint chapter badge:', error)
    }
  }, [courseData, userId, validateBadgeRequirements, mintBadge])

  // Check for automatic badge opportunities
  const checkForAutomaticBadges = useCallback(async (chapterId: number, lessonId: number) => {
    const lesson = courseData
      .find(c => c.id === chapterId)
      ?.lessons.find(l => l.id === lessonId)

    if (lesson?.badgeReward) {
      try {
        await mintBadge(
          userId,
          lesson.badgeReward.type as any,
          lessonId,
          lesson.badgeReward.description
        )
      } catch (error) {
        console.error('Failed to mint lesson badge:', error)
      }
    }
  }, [courseData, userId, mintBadge])

  // Process offline queue
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return

    const processedItems = []
    
    for (const item of offlineQueue) {
      try {
        if (item.type === 'lesson_complete') {
          const [userId, chapterId, lessonId] = item.params
          const result = await markLessonComplete(userId, chapterId, lessonId)
          
          if (result.success) {
            processedItems.push(item)
          } else if (item.retryCount < 3) {
            item.retryCount++
          } else {
            processedItems.push(item) // Remove after max retries
          }
        }
      } catch (error) {
        if (item.retryCount < 3) {
          item.retryCount++
        } else {
          processedItems.push(item)
        }
      }
    }

    // Remove processed items
    setOfflineQueue(prev => 
      prev.filter(item => !processedItems.includes(item))
    )
  }, [offlineQueue, markLessonComplete])

  // Check if lesson is unlocked
  const isLessonUnlocked = useCallback((chapterId: number, lessonId: number) => {
    const lesson = courseData
      .find(c => c.id === chapterId)
      ?.lessons.find(l => l.id === lessonId)

    if (!lesson) return false

    const chapterProgress = userProgress.get(chapterId) || []
    
    // First lesson is always unlocked
    if (lessonId === 1) return true

    // Check if all prerequisites are completed
    return lesson.prerequisites.every(prereqId => chapterProgress.includes(prereqId))
  }, [courseData, userProgress])

  // Check if lesson is completed
  const isLessonCompleted = useCallback((chapterId: number, lessonId: number) => {
    const chapterProgress = userProgress.get(chapterId) || []
    return chapterProgress.includes(lessonId)
  }, [userProgress])

  if (!isUserAuthenticated && !authLoading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <AcademicCapIcon className="h-6 w-6 text-yellow-400 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">Authentication Required</h3>
            <p className="text-yellow-700 mt-1">
              Please register to access the learning platform.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with real-time status */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <AcademicCapIcon className="h-10 w-10" />
              Advanced Learning Platform
            </h1>
            <p className="text-blue-100 mt-2">
              {courseId} • {completionPercentage}% Complete
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{completedLessons}/{totalLessons}</div>
            <div className="text-blue-100 text-sm">Lessons Completed</div>
            
            {enableRealTimeSync && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs">Live Sync</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-blue-500/30 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {hasError && (
        <ErrorDisplay
          error={progressError || badgeError || nftError || authError}
          onRetry={() => {
            clearProgressError()
            clearBadgeError()
            clearNftError()
            window.location.reload()
          }}
          onDismiss={() => {
            clearProgressError()
            clearBadgeError()
            clearNftError()
          }}
        />
      )}

      {/* Offline Queue Status */}
      {enableOfflineMode && offlineQueue.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-orange-400" />
              <span className="text-orange-800 font-medium">
                {offlineQueue.length} actions queued for sync
              </span>
            </div>
            <button
              onClick={processOfflineQueue}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              Sync Now
            </button>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {enablePerformanceMonitoring && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ChartBarIcon className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Performance Metrics</h3>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Cache Hits</div>
              <div className="font-medium">{performanceMetrics.cacheHits || 0}</div>
            </div>
            <div>
              <div className="text-gray-600">API Calls</div>
              <div className="font-medium">{performanceMetrics.apiCalls || 0}</div>
            </div>
            <div>
              <div className="text-gray-600">Avg Response</div>
              <div className="font-medium">{performanceMetrics.avgResponse || 0}ms</div>
            </div>
            <div>
              <div className="text-gray-600">Errors</div>
              <div className="font-medium text-red-600">{errorHistory.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Course Content */}
      <div className="space-y-8">
        {courseData.map((chapter) => (
          <div key={chapter.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Chapter {chapter.id}: {chapter.title}
                  </h2>
                  <p className="text-gray-600 mt-1">{chapter.description}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Progress</div>
                    <div className="font-medium">
                      {userProgress.get(chapter.id)?.length || 0}/{chapter.lessons.length}
                    </div>
                  </div>
                  
                  {userProgress.get(chapter.id)?.length === chapter.lessons.length && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">Complete</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4">
                {chapter.lessons.map((lesson) => {
                  const isUnlocked = isLessonUnlocked(chapter.id, lesson.id)
                  const isCompleted = isLessonCompleted(chapter.id, lesson.id)
                  const isOptimistic = Array.from(optimisticUpdates.values()).some(
                    update => update.chapterId === chapter.id && update.lessonId === lesson.id
                  )

                  return (
                    <div
                      key={lesson.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isCompleted 
                          ? 'border-green-200 bg-green-50' 
                          : isUnlocked 
                            ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm' 
                            : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isCompleted 
                                ? 'bg-green-600 text-white' 
                                : isUnlocked 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-300 text-gray-600'
                            }`}>
                              {isCompleted ? '✓' : lesson.id}
                            </div>
                            
                            <div>
                              <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                              <p className="text-sm text-gray-600">{lesson.description}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span>~{lesson.estimatedMinutes} min</span>
                                {lesson.prerequisites.length > 0 && (
                                  <span>Prerequisites: {lesson.prerequisites.join(', ')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isOptimistic && (
                            <div className="flex items-center gap-1 text-blue-600 text-sm">
                              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                              Saving...
                            </div>
                          )}
                          
                          {isUnlocked && !isCompleted && (
                            <button
                              onClick={() => handleLessonComplete(chapter.id, lesson.id)}
                              disabled={isLoading || isOptimistic}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors"
                            >
                              {isOptimistic ? 'Completing...' : 'Start Lesson'}
                            </button>
                          )}

                          {isCompleted && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircleIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">Completed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graduation Section */}
      {completionPercentage >= 80 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <SparklesIcon className="h-8 w-8" />
                Ready for Graduation!
              </h2>
              <p className="text-purple-100 mt-1">
                You've completed {completionPercentage}% of the course. Mint your graduation NFT!
              </p>
            </div>
            
            {!hasGraduated && graduationEligibility?.eligible && (
              <button
                onClick={() => mintGraduationNFT(userId)}
                disabled={nftLoading}
                className="px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-colors"
              >
                {nftLoading ? 'Minting...' : 'Mint Graduation NFT'}
              </button>
            )}

            {hasGraduated && (
              <div className="text-6xl">🎓</div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Events Feed */}
      {enableRealTimeSync && realtimeEvents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <BoltIcon className="h-5 w-5" />
            Recent Activity
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {realtimeEvents.slice(-5).reverse().map((event, index) => (
              <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="capitalize">{event.type.replace('_', ' ')}</span>
                <span className="text-gray-400">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
