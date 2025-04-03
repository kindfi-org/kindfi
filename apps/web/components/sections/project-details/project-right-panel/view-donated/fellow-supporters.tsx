import { Button } from '~/components/base/button'
import { PrimaryCard } from '~/components/cards/primary-card'
import { Supporter } from '../supporter'
import { TitleCardDetail } from '../title-card-detail'

export function FellowSupporter() {
	const dataSupportersMaxToShow = dataSupporters.slice(0, 5)
	const supportersOverflow =
		dataSupporters.length - dataSupportersMaxToShow.length

	return (
		<PrimaryCard>
			<TitleCardDetail>Fellow Supporters</TitleCardDetail>

			<div className="flex items-center gap-2 mt-1 mb-3">
				<div>
					{dataSupportersMaxToShow.map((item, index) => (
						<Supporter
							key={`${item - index}`}
							offSet={index > 0 ? '-ml-3' : '0'}
						/>
					))}
				</div>
				{supportersOverflow > 1 ? (
					<span className="text-gray-600">+{supportersOverflow}</span>
				) : null}
			</div>

			<Button variant="outline" size="wide">
				Join Community Chat
			</Button>
		</PrimaryCard>
	)
}

const dataSupporters = Array(300).fill(0)
