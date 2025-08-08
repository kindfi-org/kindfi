import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '~/lib/types/projects.types'
import { cn } from '~/lib/utils'
import { RenderCategories, RenderTags } from '~/lib/utils/categories-util'
import { Progress } from '../base/progress'

interface ProjectCardProps {
	project: Project
	viewMode?: 'grid' | 'list'
}

function ProjectCard({ project, viewMode = 'grid' }: ProjectCardProps) {
	const percentageComplete =
		project.percentage_complete ??
		(project.current_amount >= 0 && project.target_amount > 0
			? (project.current_amount / project.target_amount) * 100
			: 0)

	return (
		<Link
			href={`/project/${project.id}`}
			className="block h-full"
			legacyBehavior
		>
			<ProjectDetails
				project={project}
				percentageComplete={percentageComplete}
				viewMode={viewMode}
			/>
		</Link>
	)
}

export default ProjectCard

function ProjectDetails({
	project,
	percentageComplete,
	viewMode,
}: {
	project: Project
	viewMode: 'list' | 'grid'
	percentageComplete: number
}) {
	return (
		<div
			className={cn(
				'overflow-hidden transition-all duration-300 rounded-lg border border-gray-100 bg-white hover:shadow-md',
				viewMode === 'list' ? 'flex' : 'h-full relative',
			)}
		>
			<div
				className={cn(
					viewMode === 'list'
						? ' h-auto w-[200px] min-h-[180px]'
						: ' w-full h-48',
					'relative',
				)}
			>
				<Image
					src={project.image_url || '/api/placeholder/400/320'}
					alt={project.title}
					fill
					className="object-cover transition-transform duration-500 hover:scale-105"
				/>
				<RenderCategories categories={project.categories || []} />
			</div>

			<div className={'p-5 flex-1'}>
				<h3 className="text-lg font-semibold mb-2">{project.title}</h3>
				<p className="text-gray-600 mb-4 line-clamp-2 text-sm">
					{project.description}
				</p>
				<div className="mb-4">
					<div className="flex justify-between text-sm mb-1">
						<span className="font-semibold">
							${project.current_amount?.toLocaleString() ?? '0'}
						</span>
						<span className="text-gray-500">
							{percentageComplete.toFixed(0)}% of $
							{project.target_amount?.toLocaleString()}
						</span>
					</div>
					<Progress value={percentageComplete} className="h-2 bg-gray-100" />
				</div>

				<div className="flex justify-between mb-4 text-center">
					<div>
						<p className="font-semibold">
							${project.target_amount?.toLocaleString()}
						</p>
						<p className="text-xs text-gray-500">Goal</p>
					</div>
					<div>
						<p className="font-semibold">{project.kinder_count ?? 0}</p>
						<p className="text-xs text-gray-500">Investors</p>
					</div>
					<div>
						<p className="font-semibold">${project.min_investment ?? 0}</p>
						<p className="text-xs text-gray-500">Min. Investment</p>
					</div>
				</div>

				<RenderTags tags={project.tags} />
			</div>
		</div>
	)
}
