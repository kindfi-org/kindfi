import { Share2, Trophy } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Separator } from '~/components/base/separator'
import { PrimaryCard } from '~/components/cards/primary-card'
import { ButtonIconDetail } from '../button-icon-detail'
import { GoalProgress, type GoalProgressProps } from '../goal-progress'
import { NftItem } from '../nft-item'
import { FellowSupporter } from './fellow-supporters'
import { ImpactJourney } from './impact-journey'

type ViewImpactProps = GoalProgressProps & {}

export function ViewDonated({
	goal,
	percentage,
	amountOfSupport,
}: ViewImpactProps) {
	return (
		<div className="space-y-5">
			<PrimaryCard className="space-y-5">
				<GoalProgress
					amountOfSupport={amountOfSupport}
					goal={goal}
					percentage={percentage}
					isShowIcons={false}
				/>

				<div className="flex gap-2">
					<Button variant="primary-gradient" size="wide">
						Increase Impact
					</Button>
					<ButtonIconDetail>
						<Share2 className="size-5" />
					</ButtonIconDetail>
				</div>

				<div className="space-y-5">
					<div className="flex items-center gap-2 mb-4">
						<Trophy className="size-5 text-purple-500" />
						<h4 className="font-semibold">Your Rewards</h4>
					</div>

					{dataNft.map((item) => (
						<NftItem key={item.title} {...item} viewMode="donated" />
					))}
				</div>

				<Separator />
				<ImpactJourney {...dataImpactJourney} />
			</PrimaryCard>

			<FellowSupporter />
		</div>
	)
}

const dataNft = [
	{
		title: 'Early Bird NFT',
		description: 'Claimed • #042',
		isClaimed: true,
	},
	{
		title: 'Impact Maker NFT',
		description: 'Support $250 more to unlock',
		rightSite: 'Locked',
	},
]

const dataImpactJourney = {
	currentImpact: '$100',
	projectRank: '42',
	totalProjects: 234,
	supportingSince: 'Just now',
}
