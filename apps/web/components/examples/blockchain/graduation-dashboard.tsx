'use client'

import React, { useState, useEffect } from 'react'
import { useProgressTracker } from '~/hooks/blockchain/use-progress-tracker'
import { useBadgeTracker } from '~/hooks/blockchain/use-badge-tracker'
import { useGraduationNFT } from '~/hooks/blockchain/use-graduation-nft'
import { useBlockchainAuth } from '~/hooks/blockchain/use-blockchain-auth'
import { ErrorDisplay } from '~/lib/clients/blockchain/docs/error-display'
import { 
  AcademicCapIcon, 
  TrophyIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

/**
 * Graduation Dashboard - Comprehensive example showing integration of all blockchain services
 * 
 * Features:
 * - Real-time eligibility checking
 * - Progress visualization
 * - Badge collection display
 * - NFT minting with validation
 * - Error handling and recovery
 * - Loading states and optimistic updates
 * 
 * @example
 * ```tsx
 * <GraduationDashboard userId="GUSER123..." />
 * ```
 */
interface GraduationDashboardProps {
  userId: string
}

export function GraduationDashboard({ userId }: GraduationDashboardProps) {
  const { getOverallProgress, isLoading: progressLoading, error: progressError } = useProgressTracker()
  const { getUserBadges, isLoading: badgeLoading, error: badgeError } = useBadgeTracker()
  const { 
    mintGraduationNFT, 
    hasGraduationNFT, 
    checkEligibility, 
    getNFTDisplayData,
    isLoading: nftLoading, 
    error: nftError,
    clearError: clearNftError
  } = useGraduationNFT()
  const { isAuthenticated, isLoading: authLoading } = useBlockchainAuth()

  const [overallProgress, setOverallProgress] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [eligibility, setEligibility] = useState<any>(null)
  const [hasNFT, setHasNFT] = useState(false)
  const [nftData, setNftData] = useState<any>(null)
  const [isAuthenticated_, setIsAuthenticated] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check authentication
        const authStatus = await isAuthenticated(userId)
        setIsAuthenticated(authStatus)

        if (!authStatus) return

        // Load progress
        const progress = await getOverallProgress(userId)
        setOverallProgress(progress)

        // Load badges
        const userBadges = await getUserBadges(userId)
        setBadges(userBadges)

        // Check NFT status
        const nftStatus = await hasGraduationNFT(userId)
        setHasNFT(nftStatus)

        if (nftStatus) {
          const nftDisplayData = await getNFTDisplayData(userId)
          setNftData(nftDisplayData)
        }

        // Check eligibility
        const eligibilityStatus = await checkEligibility(userId)
        setEligibility(eligibilityStatus)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    }

    if (userId) {
      loadData()
    }
  }, [userId, isAuthenticated, getOverallProgress, getUserBadges, hasGraduationNFT, getNFTDisplayData, checkEligibility])

  const handleMintNFT = async () => {
    if (!eligibility?.eligible || hasNFT || isMinting) return

    setIsMinting(true)
    clearNftError()

    try {
      const result = await mintGraduationNFT(userId)
      
      if (result.success) {
        setHasNFT(true)
        setMintSuccess(true)
        
        // Load NFT display data
        const nftDisplayData = await getNFTDisplayData(userId)
        setNftData(nftDisplayData)

        // Show success for a few seconds
        setTimeout(() => setMintSuccess(false), 5000)
      }
    } catch (error) {
      console.error('Failed to mint NFT:', error)
    } finally {
      setIsMinting(false)
    }
  }

  const isLoading = progressLoading || badgeLoading || nftLoading || authLoading
  const hasError = progressError || badgeError || nftError

  if (!isAuthenticated_ && !authLoading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">Authentication Required</h3>
            <p className="text-yellow-700 mt-1">
              You need to be registered to view your graduation progress.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading && !overallProgress) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading your progress...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AcademicCapIcon className="h-8 w-8" />
              Graduation Dashboard
            </h1>
            <p className="text-blue-100 mt-1">
              Track your progress towards earning your graduation NFT
            </p>
          </div>
          
          {hasNFT && (
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
              <SparklesIcon className="h-5 w-5" />
              <span className="font-medium">Graduated!</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {hasError && (
        <ErrorDisplay
          error={progressError || badgeError || nftError}
          onRetry={() => window.location.reload()}
          onDismiss={() => {
            // Clear all errors
          }}
        />
      )}

      {/* Success Message */}
      {mintSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-green-800">
                Congratulations! 🎉
              </h3>
              <p className="text-green-700 mt-1">
                You've successfully minted your graduation NFT!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Learning Progress
          </h2>
          
          {overallProgress && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Overall Completion</span>
                  <span>{overallProgress.overallPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress.overallPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {overallProgress.completedChapters}
                  </div>
                  <div className="text-sm text-gray-600">Chapters Complete</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {badges.length}
                  </div>
                  <div className="text-sm text-gray-600">Badges Earned</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Badge Collection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrophyIcon className="h-5 w-5" />
            Badge Collection
          </h2>
          
          {badges.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {badges.slice(0, 6).map((badge, index) => (
                <div 
                  key={index}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center"
                >
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-xs font-medium text-yellow-800">
                    {badge.badge_type}
                  </div>
                  <div className="text-xs text-yellow-600">
                    #{badge.reference_id}
                  </div>
                </div>
              ))}
              {badges.length > 6 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center flex items-center justify-center">
                  <span className="text-sm text-gray-600">
                    +{badges.length - 6} more
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <TrophyIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No badges earned yet</p>
              <p className="text-sm">Complete lessons to earn badges!</p>
            </div>
          )}
        </div>
      </div>

      {/* Graduation Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Graduation Status
        </h2>

        {hasNFT ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-green-800 flex items-center gap-2">
                  <SparklesIcon className="h-6 w-6" />
                  Congratulations, Graduate!
                </h3>
                <p className="text-green-700 mt-1">
                  You've successfully completed the course and earned your graduation NFT.
                </p>
                {nftData && (
                  <div className="mt-3 text-sm text-green-600">
                    <p>Issued: {nftData.formattedIssueDate}</p>
                    <p>Badges included: {nftData.badgeCount}</p>
                  </div>
                )}
              </div>
              <div className="text-6xl">🎓</div>
            </div>
          </div>
        ) : eligibility ? (
          <div>
            {eligibility.eligible ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-blue-800">
                      Ready to Graduate!
                    </h3>
                    <p className="text-blue-700 mt-1">
                      You've met all requirements. Mint your graduation NFT now!
                    </p>
                  </div>
                  <button
                    onClick={handleMintNFT}
                    disabled={isMinting}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isMinting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Minting...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5" />
                        Mint Graduation NFT
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-yellow-800 mb-3">
                  Requirements Not Met
                </h3>
                <p className="text-yellow-700 mb-4">{eligibility.reason}</p>
                
                {eligibility.requirements && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-800">Requirements:</h4>
                    {eligibility.requirements.progress && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress: {eligibility.requirements.progress.current.percentage}%</span>
                        <span className={eligibility.requirements.progress.met ? 'text-green-600' : 'text-red-600'}>
                          {eligibility.requirements.progress.met ? '✓' : `Need ${eligibility.requirements.progress.required.percentage}%`}
                        </span>
                      </div>
                    )}
                    {eligibility.requirements.badges && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Badges: {eligibility.requirements.badges.current}</span>
                        <span className={eligibility.requirements.badges.met ? 'text-green-600' : 'text-red-600'}>
                          {eligibility.requirements.badges.met ? '✓' : `Need ${eligibility.requirements.badges.required}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Checking eligibility...</p>
          </div>
        )}
      </div>
    </div>
  )
}
