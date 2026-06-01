import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import type { Tier } from '../constants'
import { TIERS } from '../constants'

interface TierRoadmapProps {
	tier: Tier
}

export function TierRoadmap({ tier }: TierRoadmapProps) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-sm">Tier Roadmap</CardTitle>
				<p className="text-xs text-muted-foreground mt-1">
					You have one Kinder NFT that evolves through tiers. Marked tiers =
					achieved.
				</p>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-2">
					{(Object.entries(TIERS) as [Tier, (typeof TIERS)[Tier]][]).map(
						([key, cfg]) => {
							const isActive = key === tier
							const isPast = TIERS[tier].minPts >= cfg.minPts && !isActive
							return (
								<div
									key={key}
									className={`flex-1 text-center py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
										isActive
											? `${cfg.color} border`
											: isPast
												? 'bg-muted text-muted-foreground line-through'
												: 'bg-muted/50 text-muted-foreground'
									}`}
								>
									{cfg.label}
									<div className="text-[10px] font-normal mt-0.5 opacity-70">
										{cfg.minPts}+ pts
									</div>
								</div>
							)
						},
					)}
				</div>
			</CardContent>
		</Card>
	)
}
