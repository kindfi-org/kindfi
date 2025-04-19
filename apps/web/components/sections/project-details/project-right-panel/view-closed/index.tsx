import { Button } from '~/components/base/button'
import { PrimaryCard } from '~/components/cards/primary-card'
import { Community } from './community-impact'
import { NFTCollection } from './nft-collection'
import { Summary } from './summary'

type ViewClosedProps = { changeViewMode: () => void }

export function ViewClosed({ changeViewMode }: ViewClosedProps) {
	return (
		<div className="space-y-5">
			<Summary />
			<NFTCollection />
			<Community />

			<PrimaryCard>
				<Button size="wide" variant="outline" onClick={changeViewMode}>
					Back to Project Details
				</Button>
			</PrimaryCard>
		</div>
	)
}
