import { useCallback, useState } from 'react'

interface UpdateKycStatusParams {
	recordId?: string  // Primary key ID of the kyc_reviews record
	userId: string     // User ID for fallback
	status: 'pending' | 'approved' | 'rejected' | 'verified'
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

	const updateKycStatus = useCallback(
		async ({
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
			} catch (err: any) {
				setError(err.message || 'Something went wrong')
				return false
			} finally {
				setIsUpdating(false)
			}
		},
		[],
	)

	return {
		updateKycStatus,
		isUpdating,
		error,
	}
}
