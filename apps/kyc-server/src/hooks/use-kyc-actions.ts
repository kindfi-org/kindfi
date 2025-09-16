import { useState } from 'react'

import type { Enums } from '@services/supabase'

interface UpdateKycStatusParams {
	recordId?: string  // Primary key ID of the kyc_reviews record
	userId: string     // User ID for fallback
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

		try {
			// Use recordId if available, otherwise fallback to userId
			const endpoint = recordId ? `/api/kyc-reviews/${recordId}/status` : `/api/users/${userId}/status`
			const response = await fetch(endpoint, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status, notes }),
			})

			if (!response.ok) {
				const result = await response.json()
				throw new Error(result.error || 'Update failed')
			}

			return true
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
			setError(errorMessage)
			return false
		} finally {
			setIsUpdating(false)
		}
	}

	return {
		updateKycStatus,
		isUpdating,
		error,
	}
}
