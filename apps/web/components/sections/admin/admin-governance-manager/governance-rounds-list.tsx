'use client'

import { CircleDashed, Loader2, Vote } from 'lucide-react'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { GovernanceRound } from '~/lib/governance/types'
import { RoundRow } from './round-row'

interface GovernanceRoundsListProps {
	rounds: GovernanceRound[]
	isLoading: boolean
}

export const GovernanceRoundsList = ({
	rounds,
	isLoading,
}: GovernanceRoundsListProps) => {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-sm">
					<Vote className="h-4 w-4 text-muted-foreground" />
					All Rounds
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				) : rounds.length === 0 ? (
					<div className="text-center py-10 text-muted-foreground">
						<CircleDashed className="h-10 w-10 mx-auto mb-3 opacity-30" />
						<p className="text-sm">No rounds yet. Create the first one!</p>
					</div>
				) : (
					rounds.map((round) => <RoundRow key={round.id} round={round} />)
				)}
			</CardContent>
		</Card>
	)
}
