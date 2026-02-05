// hooks/use-didit-kyc.ts

import { useCallback, useEffect, useState } from 'react'

interface KYCStatus {
	status: 'pending' | 'approved' | 'rejected' | 'verified' | null
	isLoading: boolean
	error: string | null
}

interface CreateSessionResponse {
	success: boolean
	sessionId?: string
	verificationUrl?: string
	error?: string
}

/**
 * Hook for managing Didit KYC verification
 */
export function useDiditKYC(userId: string) {
	const [kycStatus, setKycStatus] = useState<KYCStatus>({
		status: null,
		isLoading: true,
		error: null,
	})

	const loadKYCStatus = useCallback(async () => {
		try {
			// Use API route instead of direct Supabase query to avoid RLS issues
			const response = await fetch('/api/kyc/status')

			if (!response.ok) {
				throw new Error(`Failed to fetch KYC status: ${response.statusText}`)
			}

			const result = await response.json()
			const status = result.status || null

			setKycStatus({
				status,
				isLoading: false,
				error: null,
			})
		} catch (error) {
			console.error('❌ Failed to load KYC status:', error)
			setKycStatus({
				status: null,
				isLoading: false,
				error:
					error instanceof Error ? error.message : 'Failed to load KYC status',
			})
		}
	}, [])

	useEffect(() => {
		if (!userId) {
			setKycStatus({ status: null, isLoading: false, error: null })
			return
		}

		loadKYCStatus()

		// Poll for status updates every 5 seconds if status is pending or null
		// This helps catch webhook updates that might be delayed
		const pollInterval = setInterval(() => {
			loadKYCStatus()
		}, 5000)

		// Cleanup interval on unmount
		return () => clearInterval(pollInterval)
	}, [userId, loadKYCStatus])

	const checkStatusFromDidit = useCallback(async () => {
		try {
			const response = await fetch('/api/kyc/didit/check-status', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			})

			if (!response.ok) {
				// If 404 or other error, just reload from database
				if (response.status === 404) {
					await loadKYCStatus()
					return { success: false, message: 'No KYC session found' }
				}
				const error = await response.json()
				throw new Error(error.error || 'Failed to check status')
			}

			const result = await response.json()

			// If no session found, that's okay - just reload from database
			if (!result.success) {
				await loadKYCStatus()
				return result
			}

			// Reload status from database after checking Didit
			await loadKYCStatus()

			return result
		} catch (error) {
			console.error('Failed to check status from Didit:', error)
			// Fallback to loading from database
			await loadKYCStatus()
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}, [loadKYCStatus])

	const createSession = async (
		redirectUrl?: string,
	): Promise<CreateSessionResponse> => {
		try {
			const response = await fetch('/api/kyc/didit/create-session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ redirectUrl }),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || 'Failed to create verification session')
			}

			const result = await response.json()

			// Reload status after creating session
			await loadKYCStatus()

			return result
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	}

	return {
		kycStatus,
		createSession,
		refreshStatus: loadKYCStatus,
		checkStatusFromDidit,
	}
}
