'use client'

import { Card, CardContent } from '~/components/base/card'

interface GovernanceRoundsStatsProps {
	totalCount: number
	activeCount: number
	endedCount: number
}

export const GovernanceRoundsStats = ({
	totalCount,
	activeCount,
	endedCount,
}: GovernanceRoundsStatsProps) => {
	const stats = [
		{ label: 'Total Rounds', value: totalCount },
		{ label: 'Active / Upcoming', value: activeCount },
		{ label: 'Ended', value: endedCount },
	]

	return (
		<div className="grid grid-cols-3 gap-3">
			{stats.map((s) => (
				<Card key={s.label}>
					<CardContent className="p-4 text-center">
						<p className="text-2xl font-bold">{s.value}</p>
						<p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
