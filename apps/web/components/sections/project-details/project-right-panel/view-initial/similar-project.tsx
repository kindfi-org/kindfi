import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { PrimaryCard } from '~/components/cards/primary-card'
import { TitleCardDetail } from '../title-card-detail'

export function SimilarProject() {
	const router = useRouter()

	return (
		<PrimaryCard className="space-y-4">
			<TitleCardDetail>Similar Project</TitleCardDetail>

			{dataProject.map((item) => (
				<ItemProject key={item.title} {...item} />
			))}

			<Button
				variant="link"
				className="flex ml-auto mr-auto"
				onClick={() => router.push('/projects')}
			>
				View more
			</Button>
		</PrimaryCard>
	)
}

type ItemProjectProps = {
	title: string
	description: string
	progress: number
	raised: string
	image: string
}

function ItemProject({
	title,
	description,
	progress,
	raised,
	image,
}: ItemProjectProps) {
	return (
		<div className="flex gap-4">
			<div className="w-20 h-20 relative">
				<Image
					src={image}
					alt={title}
					className="rounded-lg object-cover"
					fill
				/>
			</div>
			<div>
				<span className="font-semibold block">{title}</span>
				<span className="text-gray-600 line-clamp-1">{description}</span>
				<div>
					<Badge className="mr-3 font-bold text-gray-900 bg-slate-300 hover:bg-slate-400">
						${raised} raised
					</Badge>
					<span className="text-gray-600">{progress}%</span>
				</div>
			</div>
		</div>
	)
}

const dataProject = [
	{
		title: 'EcoFlow Energy Solutions',
		description: 'Renewable energy storage for residential homes',
		progress: 80,
		raised: '1.2M',
		image: '/images/renewable-energy.webp',
	},
	{
		title: 'GreenPower Storage Systems',
		description: 'Grid-scale energy storage',
		progress: 50,
		raised: '850K',
		image: '/images/bosques.webp',
	},
]
