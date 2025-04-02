import { Check, CircleUserRound } from 'lucide-react'
import { Button } from '~/components/base/button'
import { PrimaryCard } from '~/components/cards/primary-card'
import { TitleCardDetail } from '../title-card-detail'

export function ProjectCreator() {
	return (
		<PrimaryCard className="space-y-4">
			<TitleCardDetail>Project Creator</TitleCardDetail>

			<div className="flex items-center gap-4">
				<CircleUserRound className="size-10" />
				<div>
					<span className="font-semibold block text-gray-700">
						Creator Name
					</span>
					<span className="text-gray-600">Joined March 2023</span>
				</div>
			</div>
			<Button variant="outline" size="wide">
				Contact Creator
			</Button>

			<div className="flex items-center gap-4 rounded-lg bg-lime-200/85 p-4">
				<Check className="text-green-600" />
				<div>
					<span className="font-semibold block">Verified Project</span>
					<span className="text-gray-600">
						This project has been verified by KindFi
					</span>
				</div>
			</div>
		</PrimaryCard>
	)
}
