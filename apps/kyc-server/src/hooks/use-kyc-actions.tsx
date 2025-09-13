import { useCallback, useState } from 'react'

interface UpdateKycStatusParams {
	userId: string
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

	const updateKycStatus = useCallback(async ({
		userId,
		status,
		notes
	}: UpdateKycStatusParams): Promise<boolean> => {
		setIsUpdating(true)
		setError(null)

		try {
			const response = await fetch(`/api/users/${userId}/status`, {
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
			console.log('Status update error:', err)
			setError(err.message || 'Something went wrong')
			return false
		} finally {
			setIsUpdating(false)
		}
	}, [])

	return {
		updateKycStatus,
		isUpdating,
		error,
	}
}