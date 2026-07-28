// hooks/use-didit-kyc.ts

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { logger } from '@/lib/logger'

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

type KycStatusData = {
	status: KYCStatus['status']
}

const KYC_STATUS_QUERY_KEY = (userId: string) => ['kyc-status', userId] as const

const fetchKycStatus = async (): Promise<KycStatusData> => {
	const response = await fetch('/api/kyc/status')

	if (!response.ok) {
		throw new Error(`Failed to fetch KYC status: ${response.statusText}`)
	}

	const result = await response.json()
	return { status: result.status || null }
}

type UseDiditKYCOptions = {
	/** When false, skips the initial status fetch (e.g. section not visible). */
	enabled?: boolean
}

/**
 * Hook for managing Didit KYC verification.
 * Fetches status once when enabled; use refreshStatus / checkStatusFromDidit after user actions.
 */
export function useDiditKYC(userId: string, options: UseDiditKYCOptions = {}) {
	const { enabled = true } = options
	const queryClient = useQueryClient()

	const { data, isLoading, error } = useQuery({
		queryKey: KYC_STATUS_QUERY_KEY(userId),
		queryFn: fetchKycStatus,
		enabled: Boolean(userId) && enabled,
		staleTime: Number.POSITIVE_INFINITY,
		gcTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
	})

	const kycStatus: KYCStatus = {
		status: data?.status ?? null,
		isLoading: Boolean(userId) && isLoading,
		error: error instanceof Error ? error.message : error ? String(error) : null,
	}

	const loadKYCStatus = useCallback(async () => {
		if (!userId) return
		await queryClient.invalidateQueries({ queryKey: KYC_STATUS_QUERY_KEY(userId) })
	}, [queryClient, userId])

	const checkStatusFromDidit = useCallback(async () => {
		try {
			const response = await fetch('/api/kyc/didit/check-status', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			})

			if (!response.ok) {
				if (response.status === 404) {
					await loadKYCStatus()
					return { success: false, message: 'No KYC session found' }
				}
				const errorResponse = await response.json()
				throw new Error(errorResponse.error || 'Failed to check status')
			}

			const result = await response.json()

			if (!result.success) {
				await loadKYCStatus()
				return result
			}

			await loadKYCStatus()
			return result
		} catch (checkError) {
			logger.error('Failed to check status from Didit:', checkError)
			await loadKYCStatus()
			return {
				success: false,
				error: checkError instanceof Error ? checkError.message : 'Unknown error',
			}
		}
	}, [loadKYCStatus])

	const createSession = async (redirectUrl?: string): Promise<CreateSessionResponse> => {
		try {
			const response = await fetch('/api/kyc/didit/create-session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ redirectUrl }),
			})

			if (!response.ok) {
				const errorResponse = await response.json()
				throw new Error(errorResponse.error || 'Failed to create verification session')
			}

			const result = await response.json()
			await loadKYCStatus()
			return result
		} catch (createError) {
			return {
				success: false,
				error: createError instanceof Error ? createError.message : 'Unknown error',
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
