import { Button } from '~/components/base/button'
import { PrimaryCard } from '~/components/cards/primary-card'
import { NftItem } from '../nft-item'
import { TitleCardDetail } from '../title-card-detail'

export function NFTCollection() {
	return (
		<PrimaryCard className="space-y-4">
			<TitleCardDetail>Your NFT Collection</TitleCardDetail>
			<NftItem title="Early Bird NFT" description="#042" viewMode="closed" />

			<Button size="wide" variant="outline">
				View in NFT Gallery
			</Button>
		</PrimaryCard>
	)
}
