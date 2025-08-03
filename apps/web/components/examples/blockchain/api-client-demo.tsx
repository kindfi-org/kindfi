'use client'

import React, { useState, useEffect } from 'react'
import { createBlockchainApiClient } from '~/lib/clients/blockchain/blockchain-api-client'
import { ErrorDisplay } from '~/lib/clients/blockchain/docs/error-display'
import { 
  CloudIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

/**
 * API Client Demo - Demonstrates HTTP API client usage with Docker container
 * 
 * Features:
 * - HTTP client initialization and configuration
 * - Real-time API health monitoring
 * - Error handling with retry mechanisms
 * - Performance metrics display
 * - Complete user journey execution
 * - Circuit breaker pattern demonstration
 * 
 * @example
 * ```tsx
 * <ApiClientDemo 
 *   apiUrl="http://localhost:8080"
 *   userId="GUSER123..."
 * />
 * ```
 */
interface ApiClientDemoProps {
  apiUrl?: string
  userId: string
}

export function ApiClientDemo({ 
  apiUrl = 'http://localhost:8080',
  userId 
}: ApiClientDemoProps) {
  const [client] = useState(() => createBlockchainApiClient({
    baseUrl: apiUrl,
    timeout: 30000,
    retryAttempts: 3,
    enableLogging: true
  }))

  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [journeyResults, setJourneyResults] = useState<any>(null)
  const [isRunningJourney, setIsRunningJourney] = useState(false)

  // Health check interval
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await client.system.getHealth()
        if (health.success) {
          setHealthStatus(health.data)
          setIsConnected(true)
          setLastError(null)
        } else {
          setIsConnected(false)
          setLastError(health.error || 'Health check failed')
        }
      } catch (error) {
        setIsConnected(false)
        setLastError(error instanceof Error ? error.message : 'Connection failed')
      }
    }

    // Initial check
    checkHealth()

    // Set up interval
    const interval = setInterval(checkHealth, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [client])

  // Metrics update interval
  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = client.getMetrics()
      setMetrics(currentMetrics)
    }

    // Initial update
    updateMetrics()

    // Set up interval
    const interval = setInterval(updateMetrics, 5000) // Every 5 seconds

    return () => clearInterval(interval)
  }, [client])

  const runUserJourney = async () => {
    setIsRunningJourney(true)
    setJourneyResults(null)
    setLastError(null)

    try {
      const results = await client.executeUserJourney(userId)
      setJourneyResults(results)
    } catch (error) {
      setLastError(error instanceof Error ? error.message : 'Journey failed')
    } finally {
      setIsRunningJourney(false)
    }
  }

  const testIndividualEndpoints = async () => {
    const results = []

    try {
      // Test progress tracker
      const progressResult = await client.progressTracker.markLessonComplete(userId, 1, 1)
      results.push({ service: 'Progress Tracker', success: progressResult.success, error: progressResult.error })

      // Test badge tracker
      const badgeResult = await client.badgeTracker.mintBadge(userId, 'ChapterCompletion' as any, 1, 'Test badge')
      results.push({ service: 'Badge Tracker', success: badgeResult.success, error: badgeResult.error })

      // Test auth controller
      const authResult = await client.authController.isAuthenticated(userId)
      results.push({ service: 'Auth Controller', success: authResult.success, error: authResult.error })

      // Test graduation NFT
      const nftResult = await client.graduationNFT.hasGraduationNFT(userId)
      results.push({ service: 'Graduation NFT', success: nftResult.success, error: nftResult.error })

      console.log('Individual endpoint test results:', results)
    } catch (error) {
      console.error('Endpoint testing failed:', error)
    }
  }

  const clearCache = () => {
    client.clearCache()
    setMetrics(client.getMetrics())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CloudIcon className="h-8 w-8 text-blue-600" />
              API Client Demo
            </h1>
            <p className="text-gray-600 mt-1">
              Demonstrating HTTP API client integration with Docker container
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {lastError && (
        <ErrorDisplay
          error={lastError}
          onRetry={() => window.location.reload()}
          onDismiss={() => setLastError(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Service Health
          </h2>
          
          {healthStatus ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`text-sm font-medium ${
                  healthStatus.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {healthStatus.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.floor(healthStatus.uptime / 1000)}s
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API URL</span>
                <span className="text-sm font-mono text-gray-700">
                  {apiUrl}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Checking health...</p>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" />
              Performance Metrics
            </h2>
            <button
              onClick={clearCache}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Clear Cache
            </button>
          </div>
          
          {metrics ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Requests</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics.totalRequests}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium text-green-600">
                  {metrics.totalRequests > 0 
                    ? Math.round((metrics.successfulRequests / metrics.totalRequests) * 100)
                    : 0
                  }%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round(metrics.averageResponseTime)}ms
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failed Requests</span>
                <span className={`text-sm font-medium ${
                  metrics.failedRequests > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {metrics.failedRequests}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">No metrics available</p>
            </div>
          )}
        </div>
      </div>

      {/* API Testing */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          API Testing
        </h2>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={runUserJourney}
              disabled={isRunningJourney || !isConnected}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
            >
              {isRunningJourney ? 'Running Journey...' : 'Run Complete User Journey'}
            </button>
            
            <button
              onClick={testIndividualEndpoints}
              disabled={!isConnected}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-md transition-colors"
            >
              Test Individual Endpoints
            </button>
          </div>

          {/* Journey Results */}
          {journeyResults && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">
                User Journey Results
              </h3>
              
              <div className="space-y-2">
                {journeyResults.steps.map((step: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    {step.success ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className="flex-1">{step.step}</span>
                    {step.error && (
                      <span className="text-red-600 text-xs">{step.error}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Overall Result:</span>
                  <span className={`text-sm font-medium ${
                    journeyResults.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {journeyResults.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Client Configuration
        </h2>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Base URL:</span>
            <span className="ml-2 font-mono text-gray-900">{apiUrl}</span>
          </div>
          <div>
            <span className="text-gray-600">Timeout:</span>
            <span className="ml-2 text-gray-900">30s</span>
          </div>
          <div>
            <span className="text-gray-600">Retry Attempts:</span>
            <span className="ml-2 text-gray-900">3</span>
          </div>
          <div>
            <span className="text-gray-600">Logging:</span>
            <span className="ml-2 text-gray-900">Enabled</span>
          </div>
        </div>
      </div>
    </div>
  )
}
