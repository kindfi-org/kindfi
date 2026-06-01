'use client'

import { useQueryClient } from '@tanstack/react-query'
import { CreateRoundDialog } from './create-round-dialog'
import { GovernanceRoundsList } from './governance-rounds-list'
import { GovernanceRoundsStats } from './governance-rounds-stats'
import { useGovernanceRounds } from './hooks/use-governance-rounds'

export const AdminGovernanceManager = () => {
	const queryClient = useQueryClient()
	const { rounds, activeCount, endedCount, isLoading } = useGovernanceRounds()

	const handleRoundCreated = () => {
		queryClient.invalidateQueries({ queryKey: ['governance-rounds'] })
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4 flex-wrap">
				<div>
					<h2 className="text-xl font-bold">Governance Rounds</h2>
					<p className="text-sm text-muted-foreground mt-0.5">
						Create and manage community fund voting rounds.
					</p>
				</div>
				<CreateRoundDialog onCreated={handleRoundCreated} />
			</div>

			<GovernanceRoundsStats
				totalCount={rounds.length}
				activeCount={activeCount}
				endedCount={endedCount}
			/>

			<GovernanceRoundsList rounds={rounds} isLoading={isLoading} />
		</div>
	)
}
