import { useCallback, useEffect, useState } from 'react'
import { KycTable } from '~/components/dashboard/table/kyc-table'
import type { KycRecord } from '~/lib/types/dashboard'

interface KycTableContainerProps {
	onStatusUpdate?: () => void
	onReview?: (userId: string) => void
	refreshTrigger?: number
}

export function KycTableContainer({ 
	onStatusUpdate, 
	onReview,
	refreshTrigger = 0 
}: KycTableContainerProps) {
	const [data, setData] = useState<KycRecord[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchUsers = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)

			const response = await fetch('/api/users')
			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch users')
			}

			if (result.success) {
				setData(result.data)
			} else {
				throw new Error('Invalid response format')
			}
		} catch (err: unknown) {
			console.error('Users fetch error:', err)
			const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
			setError(errorMessage)
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Fetch data on mount and when refreshTrigger changes
	useEffect(() => {
		fetchUsers()
	}, [fetchUsers, refreshTrigger])

	// Enhanced status update handler that refetches data
	const handleStatusUpdate = useCallback(() => {
		onStatusUpdate?.()
		fetchUsers() // Refetch data after status update
	}, [onStatusUpdate, fetchUsers])

	if (error) {
		return (
			<div className="flex w-full flex-col justify-start gap-6">
				<div className="flex items-center justify-center h-64 px-4 lg:px-6 rounded-lg border border-red-200 bg-red-50">
					<div className="text-center space-y-4">
						<p className="text-red-600 font-medium">Failed to load users</p>
						<p className="text-red-500 text-sm">{error}</p>
						<button
							onClick={fetchUsers}
							className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
							type="button"
						>
							Try Again
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<KycTable
			data={data}
			isLoading={isLoading}
			onStatusUpdate={handleStatusUpdate}
			onReview={onReview}
		/>
	)
}