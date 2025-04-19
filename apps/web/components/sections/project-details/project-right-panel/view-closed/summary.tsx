import { Trophy } from 'lucide-react'
import { PrimaryCard } from '~/components/cards/primary-card'
import { itemsImpactSummary } from '~/lib/mock-data/project/mock-project-side-panel'
import { cn } from '~/lib/utils'
import { TitleCardDetail } from '../title-card-detail'

export function Summary() {
	return (
		<PrimaryCard className="space-y-4">
			<TitleCardDetail>Your Impact Summary</TitleCardDetail>

			<div className="bg-green-50 p-4 rounded-lg text-green-600">
				<div className="flex items-center gap-2 mb-2 font-semibold">
					<Trophy className="size-5" />
					<span className="text-gray-700">Top 10% Supporter</span>
				</div>
				<span className="text-3xl font-bold mb-1 block">$1,000</span>
				<span>Total Contribution</span>
			</div>

			<div className="grid grid-cols-3 gap-4">
				{itemsImpactSummary.map((item) => (
					<ItemImpact
						key={item.name}
						name={item.name as ImpactItemName}
						value={item.value}
					/>
				))}
			</div>
		</PrimaryCard>
	)
}

type ImpactItemName = 'nft' | 'referrals' | 'points'

export function ItemImpact({
	name,
	value,
}: {
	name: ImpactItemName
	value: number
}) {
	return (
		<div className={cn('p-4 rounded-lg text-center', styleItemImpact[name])}>
			<span className="text-2xl font-bold">{value}</span>
			<span className="block">{textItemImpact[name]}</span>
		</div>
	)
}

const styleItemImpact = {
	nft: 'text-purple-600 bg-purple-50',
	referrals: 'text-blue-600 bg-blue-50',
	points: 'text-orange-600 bg-orange-50',
}
const textItemImpact = {
	nft: 'NFTs Earned',
	referrals: 'Referrals',
	points: 'Impact Points',
}
