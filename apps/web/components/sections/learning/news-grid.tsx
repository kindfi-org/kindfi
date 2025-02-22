import { NewsCard } from '~/components/cards/news-card'
import type { NewsUpdate } from '~/lib/types/learning.types'

interface NewsGridProps {
	updates: NewsUpdate[]
}

export function NewsGrid({ updates }: NewsGridProps) {
	return (
		<div className="grid-auto-fit max-w-5xl mx-auto gap-6">
			{updates.map((update) => (
				<NewsCard key={update.id} update={update} />
			))}
		</div>
	)
}
