import { StatBadge } from '../utils/helpers'

interface NftStatsGridProps {
	impactScore: string
	donations: string
	quests: string
	streaks: string
	referrals: string
}

export function NftStatsGrid({
	impactScore,
	donations,
	quests,
	streaks,
	referrals,
}: NftStatsGridProps) {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
			<StatBadge label="Impact" value={impactScore || '0'} />
			<StatBadge label="Donations" value={donations || '0'} />
			<StatBadge label="Quests" value={quests || '0'} />
			<StatBadge label="Streak" value={streaks || '0'} />
			<StatBadge label="Referrals" value={referrals || '0'} />
		</div>
	)
}
