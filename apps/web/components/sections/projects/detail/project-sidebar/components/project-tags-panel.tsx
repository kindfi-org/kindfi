import { Badge } from '~/components/base/badge'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { cn } from '~/lib/utils'
import { getContrastTextColor } from '~/lib/utils/color-utils'

interface ProjectTagsPanelProps {
	tags: ProjectDetail['tags']
}

export function ProjectTagsPanel({ tags }: ProjectTagsPanelProps) {
	return (
		<div className="p-6 bg-gray-50 border-t border-gray-200">
			<h3 className="mb-2 font-medium">Project Tags</h3>
			<div className="flex flex-wrap gap-2">
				{tags.map((tag) => {
					const bg = tag.color || '#ccc'
					const textColor = getContrastTextColor(bg)

					return (
						<Badge
							key={tag.id}
							className={cn('uppercase', textColor)}
							style={{ backgroundColor: bg }}
						>
							{tag.name}
						</Badge>
					)
				})}
			</div>
		</div>
	)
}
