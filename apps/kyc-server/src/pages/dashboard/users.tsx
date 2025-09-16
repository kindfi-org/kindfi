import { useCallback, useState } from 'react'
import { MetricsGridContainer } from '~/components/dashboard/cards/metrics-grid-container'
import { KycTableContainer } from '~/components/dashboard/table/kyc-table-container'
import { useKYCWebSocket } from '~/hooks/use-kyc-ws'

export default function Users() {
	const [refreshTrigger, setRefreshTrigger] = useState(0)

	// WebSocket integration for real-time updates
	const { isConnected } = useKYCWebSocket({
		onUpdate: (update) => {
			console.log('KYC status update received:', update)
			// Trigger refresh of components
			setRefreshTrigger(prev => prev + 1)
		},
	})

	const handleStatusUpdate = useCallback(() => {
		// Force refresh of data
		setRefreshTrigger(prev => prev + 1)
	}, [])

	const handleReview = useCallback((userId: string) => {
		console.log('Review user:', userId)
		// TODO: Implement review functionality
	}, [])

	return (
		<div className="@container/main flex flex-1 flex-col gap-2 bg-background">
			<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
				<div className="px-4 lg:px-6">
					{isConnected && (
						<div className="flex items-center gap-1">
							<div className="size-2 bg-green-500 rounded-full animate-pulse" />
							<span className="text-xs text-green-600 font-medium">Live</span>
						</div>
					)}
				</div>
				<MetricsGridContainer key={`metrics-${refreshTrigger}`} />
				<KycTableContainer 
					onStatusUpdate={handleStatusUpdate}
					onReview={handleReview}
					refreshTrigger={refreshTrigger}
				/>
			</div>
		</div>
	)
}
