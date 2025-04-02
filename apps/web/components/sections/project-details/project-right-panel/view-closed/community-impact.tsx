import { Globe, Heart } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { PrimaryCard } from '~/components/cards/primary-card'
import { Supporter } from '../supporter'
import { TitleCardDetail } from '../title-card-detail'

export function Community() {
	const dataSupportersMaxToShow = dataSupporters.slice(0, 5)
	const supportersOverflow =
		dataSupporters.length - dataSupportersMaxToShow.length

	return (
		<PrimaryCard className="space-y-4">
			<TitleCardDetail>Community Impact</TitleCardDetail>

			<div className="flex items-center gap-2 mt-1 mb-3">
				<div>
					{dataSupportersMaxToShow.map((item, index) => (
						<Supporter
							key={`${item + index}`}
							offSet={index > 0 ? '-ml-3' : '0'}
						/>
					))}
				</div>
				{supportersOverflow > 1 ? (
					<span className="text-gray-600">+{supportersOverflow}</span>
				) : null}
			</div>

			{comments.map((comment) => (
				<Comments key={comment.id} {...comment} />
			))}

			<div className="flex gap-2 flex-col">
				<Button size="wide" variant="secondary">
					Join Success Celebration
				</Button>
				<Button size="wide" variant="outline">
					<Globe className="size-5" />
					View All Comments
				</Button>
			</div>
		</PrimaryCard>
	)
}

type CommentsProps = {
	id?: string
	name: string
	badge: string
	comment: string
	likes: number
}

export function Comments({ name, badge, comment, likes }: CommentsProps) {
	return (
		<div className="flex gap-3">
			<div className="flex items-center justify-center size-10 bg-gray-100 rounded-full">
				{name.charAt(0)}
			</div>
			<div className="flex-1">
				<div className="flex items-center gap-2 mb-1">
					<span className="font-semibold">{name}</span>
					<Badge>{badge}</Badge>
				</div>
				<p className="text-gray-600 mb-2">{comment}</p>
				<div className="flex items-center gap-2 text-gray-600">
					<Heart className="size-4" />
					<span>{likes}</span>
					<Button>Reply</Button>
				</div>
			</div>
		</div>
	)
}

const comments = [
	{
		id: 'comment-1',
		name: 'Sarah M.',
		badge: 'Early Supporter',
		comment:
			'Amazing to see the project reach its goal! The community really came together. 🎉',
		likes: 24,
	},
	{
		id: 'comment-2',
		name: 'David K.',
		badge: 'Project Champion',
		comment:
			'The transparency and regular updates made this journey special. Looking forward to the impact report! 📊',
		likes: 18,
	},
]
const dataSupporters = Array(300).fill(0)
