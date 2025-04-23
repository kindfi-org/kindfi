import { Star } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { cn } from '~/lib/utils'
import type { ViewModeProps } from './type'

type NftItemProps = {
	title: string
	description: string
	rightSide?: string
	isClaimed?: boolean
	viewMode?: ViewModeProps
	badgeText?: string
}

export function NftItem({
	title,
	viewMode = 'initial',
	description,
	rightSide = '',
	isClaimed = false,
	badgeText = 'Common',
}: NftItemProps) {
	const isBgPurple = viewMode === 'closed' || isClaimed

	const renderRightSite = () => {
		switch (viewMode) {
			case 'donated':
				return isClaimed ? (
					<Star className="size-5 text-purple-500" />
				) : (
					<span className="text-gray-600">{rightSide}</span>
				)
			case 'closed':
				return <Badge variant="purple">{badgeText}</Badge>
			default:
				return (
					<span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-sm">
						{rightSide}
					</span>
				)
		}
	}

	return (
		<div
			className={cn('p-4 bg-gray-50 rounded-lg', isBgPurple && 'bg-purple-50')}
		>
			<div className="flex justify-between">
				<h4 className="font-semibold text-gray-700">{title}</h4>
				{renderRightSite()}
			</div>

			<span className={cn('text-gray-600', isClaimed && 'text-purple-600')}>
				{description}
			</span>
		</div>
	)
}
