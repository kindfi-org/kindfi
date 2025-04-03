import { Gift } from 'lucide-react'
import { PrimaryCard } from '~/components/cards/primary-card'
import { NftItem } from '../nft-item'
import { TitleCardDetail } from '../title-card-detail'
import type { NftTier, ViewModeProps } from '../type'

type NftRewardProps = {
	nftTiers: NftTier[]
	viewMode: ViewModeProps
}

export function NftReward({ nftTiers, viewMode }: NftRewardProps) {
	return (
		<PrimaryCard className="space-y-5">
			<TitleCardDetail className="flex items-center gap-2">
				<Gift className="size-5 text-purple-500" />
				NFT Rewards
			</TitleCardDetail>

			{nftTiers.map((item) => (
				<NftItem key={item.title} {...item} viewMode={viewMode} />
			))}
		</PrimaryCard>
	)
}
