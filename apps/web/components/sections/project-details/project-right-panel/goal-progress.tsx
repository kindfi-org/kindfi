import { Bookmark, Share2 } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Progress } from '~/components/base/progress'
import { ButtonIconDetail } from './button-icon-detail'

export type GoalProgressProps = {
	goal: number
	percentage: number
	amountOfSupport: number
	isShowIcons?: boolean
}

export function GoalProgress({
	goal,
	percentage,
	amountOfSupport,
	isShowIcons = true,
}: GoalProgressProps) {
	const amountFormatted = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amountOfSupport)
	const goalFormatted = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(goal)

	return (
		<div>
			<div className="flex justify-between items-end gap-4">
				<div className="flex items-center gap-4">
					<span className="text-3xl font-bold">{amountFormatted}</span>
					<Badge>{Math.min(percentage, 100)}%</Badge>
				</div>

				{isShowIcons && (
					<div className="flex gap-2 items-center">
						<ButtonIconDetail>
							<Share2 className="size-5" />
						</ButtonIconDetail>
						<ButtonIconDetail>
							<Bookmark className="size-5" />
						</ButtonIconDetail>
					</div>
				)}
			</div>

			<div className="text-gray-500">of {goalFormatted} goal</div>
			<Progress value={Math.min(percentage, 100)} className="h-2 mt-3" />
		</div>
	)
}
