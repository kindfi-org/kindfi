import type { EscrowEndpoint } from '~/lib/types/escrow/escrow-endpoint.types'

export const getEndpoint = (action: EscrowEndpoint): string => {
	const endpoints: Record<EscrowEndpoint, string> = {
		initiate: '/deployer/invoke-deployer-contract',
		fund: '/escrow/fund-escrow',
		dispute: '/escrow/change-dispute-flag',
		resolve: '/escrow/resolving-disputes',
		release: '/escrow/distribute-escrow-earnings',
		completeMilestone: '/escrow/change-milestone-status',
		approveMilestone: '/escrow/change-milestone-flag',
		edit: '/escrow/update-escrow-by-contract-id',
		startDispute: '/escrow/start-dispute',
		resolveDispute: '/escrow/resolve-dispute',
	}
	return endpoints[action]
}
