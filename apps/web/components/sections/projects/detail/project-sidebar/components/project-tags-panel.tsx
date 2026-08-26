import { ProjectTagList } from '~/components/sections/projects/shared'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'

interface ProjectTagsPanelProps {
	tags: ProjectDetail['tags']
}

export function ProjectTagsPanel({ tags }: ProjectTagsPanelProps) {
	return (
		<div className="border-t border-gray-200 bg-gray-50 p-6">
			<h3 className="mb-2 font-medium">Project Tags</h3>
			<ProjectTagList tags={tags} className="gap-2" />
		</div>
	)
}
