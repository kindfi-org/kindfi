import type { Enums } from '@services/supabase'
import { useState } from 'react'

interface UpdateKycStatusParams {
	recordId?: string // Primary key ID of the kyc_reviews record
	userId: string // User ID for fallback
	status: Enums<'kyc_status_enum'>
	notes?: string
}

interface UseKycActionsReturn {
	updateKycStatus: (params: UpdateKycStatusParams) => Promise<boolean>
	isUpdating: boolean
	error: string | null
}

export function useKycActions(): UseKycActionsReturn {
	const [isUpdating, setIsUpdating] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const updateKycStatus = async ({
		recordId,
		userId,
		status,
		notes,
	}: UpdateKycStatusParams): Promise<boolean> => {
		setIsUpdating(true)
		setError(null)

		const controller = new AbortController()
		const timeoutId = setTimeout(() => {
			controller.abort()
		}, 10000) // 10 second timeout

		try {
			// Use recordId if available, otherwise fallback to userId
			const endpoint = recordId
				? `/api/kyc-reviews/${recordId}/status`
				: `/api/users/${userId}/status`
			const response = await fetch(endpoint, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status, notes }),
				signal: controller.signal,
				credentials: 'same-origin',
			})

			if (!response.ok) {
				const result = await response.json()
				throw new Error(result.error || 'Update failed')
			}

			return true
		} catch (err: unknown) {
			if (err instanceof Error && err.name === 'AbortError') {
				setError('Request timed out. Please try again.')
			} else {
				const errorMessage =
					err instanceof Error ? err.message : 'Something went wrong'
				setError(errorMessage)
			}
			return false
		} finally {
			clearTimeout(timeoutId)
			setIsUpdating(false)
		}
	}

	return {
		updateKycStatus,
		isUpdating,
		error,
	}
}
