import { useCallback, useEffect, useRef, useState } from 'react'
import { KycTable } from '~/components/dashboard/table/kyc-table'
import type { KycRecord, KycRecordApi } from '~/lib/types/dashboard'
import { mapKycRecordApiToDomain } from '~/lib/types/dashboard'

interface KycTableContainerProps {
	onStatusUpdate?: () => void
	onReview?: (userId: string) => void
	refreshTrigger?: number
	isConnected?: boolean
}

interface ApiResponse {
	success: boolean
	data: KycRecordApi[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

export function KycTableContainer({ 
	onStatusUpdate, 
	onReview,
	refreshTrigger = 0,
	isConnected = false
}: KycTableContainerProps) {
	const [data, setData] = useState<KycRecord[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	
	const abortControllerRef = useRef<AbortController | null>(null)
	const isMountedRef = useRef(true)

	const fetchUsers = useCallback(async () => {
		// Abort any previous request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
		}

		// Create new abort controller for this request
		const controller = new AbortController()
		abortControllerRef.current = controller

		if (!isMountedRef.current) return

		try {
			setIsLoading(true)
			setError(null)

			// Use server-side pagination with a reasonable page size
			// This prevents loading all records at once for large datasets
			const searchParams = new URLSearchParams({
				page: '1',
				limit: '50', // Fetch more records per request to reduce API calls
				sortBy: 'created_at',
				sortOrder: 'desc'
			})

			const response = await fetch(`/api/users?${searchParams.toString()}`, {
				signal: controller.signal
			})

			// Check if request was aborted or component unmounted
			if (controller.signal.aborted || !isMountedRef.current) {
				return
			}

			const result: ApiResponse = await response.json()

			// Check again after async operation
			if (controller.signal.aborted || !isMountedRef.current) {
				return
			}

			if (!response.ok) {
				throw new Error(result.success === false ? 'Failed to fetch users' : 'Network error')
			}

			if (result.success) {
				const mappedData = result.data.map(mapKycRecordApiToDomain)
				setData(mappedData)
				// Note: For true large dataset support, the table component
				// would need to be updated to handle server-side pagination
				// This is a compromise solution that fetches more records per page
			} else {
				throw new Error('Invalid response format')
			}
		} catch (err: unknown) {
			// Don't update state if aborted or unmounted
			if (controller.signal.aborted || !isMountedRef.current) {
				return
			}

			// Handle AbortError specifically - don't treat as error
			if (err instanceof Error && err.name === 'AbortError') {
				return
			}

			console.error('Users fetch error:', err)
			const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
			setError(errorMessage)
		} finally {
			// Only set loading false if not aborted and still mounted
			if (!controller.signal.aborted && isMountedRef.current) {
				setIsLoading(false)
			}
		}
	}, [])

	// Mount/unmount effect for cleanup
	useEffect(() => {
		isMountedRef.current = true
		
		return () => {
			isMountedRef.current = false
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}
		}
	}, [])

	// Effect for initial fetch and when fetchUsers function changes
	useEffect(() => {
		fetchUsers()
	}, [fetchUsers])
	
	// Effect for manual refresh when refreshTrigger changes
	useEffect(() => {
		if (refreshTrigger > 0) {
			fetchUsers()
		}
	}, [refreshTrigger, fetchUsers])

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
							onClick={() => {
								if (isLoading) return
								fetchUsers()
							}}
							disabled={isLoading}
							aria-disabled={isLoading}
							aria-busy={isLoading}
							className={`px-4 py-2 text-sm text-white rounded-md transition-colors ${
								isLoading 
									? 'bg-red-400 cursor-not-allowed opacity-50' 
									: 'bg-red-600 hover:bg-red-700'
							}`}
							type="button"
						>
							{isLoading ? 'Loading...' : 'Try Again'}
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
			isConnected={isConnected}
		/>
	)
}