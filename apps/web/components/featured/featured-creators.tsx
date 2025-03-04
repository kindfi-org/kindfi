import type { Creator } from '~/lib/types/featured-projects/featured-projects.types'
import { CreatorCard } from './creator-card'

interface FeaturedCreatorsProps {
	creators: Creator[]
	title: string
	description: string
}

export const FeaturedCreators: React.FC<FeaturedCreatorsProps> = ({
	creators,
	title,
	description,
}) => {
	return (
		<section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#FAFAFA]">
			<div className="container">
				<div className="text-center max-w-2xl mx-auto mb-20">
					<h2 className="text-3xl font-bold tracking-tight lg:text-4xl mb-4">
						{title}
					</h2>
					<p className="text-lg text-muted-foreground">{description}</p>
				</div>

				<div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
					{creators.map((creator) => (
						<CreatorCard key={creator.id} creator={creator} />
					))}
				</div>
			</div>
		</section>
	)
}
