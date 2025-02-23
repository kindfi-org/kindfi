import { ResourceCard } from '~/components/cards/resource-card'
import type { Resource } from '~/lib/types/learning.types'

interface ResourceGridProps {
	resources: Resource[]
}

export function ResourceGrid({ resources }: ResourceGridProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{resources.map((resource) => (
				<ResourceCard key={resource.id} resource={resource} />
			))}
		</div>
	)
}
