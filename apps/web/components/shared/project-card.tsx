import Image from 'next/image'
import type { Project, Tag } from '~/lib/types/projects.types'
import { getA11yColorMatch } from '~/lib/utils/color-utils'
import { Progress } from '../base/progress'

interface ProjectCardProps {
	project: Project
	viewMode?: 'grid' | 'list'
}

// Extracted the shared tag rendering logic
const RenderTags = ({ tags }: { tags: Tag[] | string[] }) => {
	if (!Array.isArray(tags)) return null // Prevents errors if undefined or not an array

	return (
		<div className="flex flex-wrap gap-2 mt-4">
			{tags.map((tag) => (
				<span
					key={typeof tag === 'string' ? tag : tag.id}
					className="px-2 py-1 text-xs rounded uppercase"
					style={
						typeof tag === 'string'
							? { backgroundColor: '#E5E7EB', color: '#374151' }
							: typeof tag.color !== 'string'
								? {
										backgroundColor: tag.color?.backgroundColor ?? '',
										color: tag.color?.textColor ?? '',
									}
								: {
										backgroundColor: tag.color,
										color: getA11yColorMatch(tag.color)[1], // Use accessible text color
									}
					}
				>
					{typeof tag === 'string' ? tag : tag.text}
				</span>
			))}
		</div>
	)
}

const RenderCategories = ({ categories }: { categories: string[] }) =>
	categories?.length ? (
		<div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
			{categories.map((category, index) => (
				<span
					key={category}
					className="bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm"
				>
					{category}
				</span>
			))}
		</div>
	) : null

function ProjectCard({ project, viewMode = 'grid' }: ProjectCardProps) {
	const targetAmount = project.target_amount ?? project.goal
	const percentageComplete =
		project.percentageComplete ??
		(project.current_amount && project.target_amount
			? (project.current_amount / project.target_amount) * 100
			: 0)

	return viewMode === 'list' ? (
		<div className="overflow-hidden transition-shadow duration-300 rounded-lg border border-gray-100 bg-white flex">
			<div className="relative h-auto w-[200px] min-h-[180px]">
				<Image
					src={project.image_url || '/api/placeholder/400/320'}
					alt={project.title}
					fill
					className="object-cover"
				/>
				<RenderCategories categories={project.categories || []} />
			</div>

			<div className="flex-1 p-5">
				<h3 className="text-lg font-semibold mb-2">{project.title}</h3>
				<p className="text-gray-600 mb-4 line-clamp-2 text-sm">
					{project.description}
				</p>

				<ProjectDetails
					project={project}
					percentageComplete={percentageComplete}
				/>
			</div>
		</div>
	) : (
		<div className="overflow-hidden transition-shadow duration-300 rounded-lg border border-gray-100 bg-white h-full relative">
			<div className="relative w-full h-48">
				<Image
					src={project.image_url || '/api/placeholder/400/320'}
					alt={project.title}
					fill
					className="object-cover transition-transform duration-500 hover:scale-105"
				/>
				<RenderCategories categories={project.categories || []} />
			</div>

			<div className="p-5">
				<h3 className="text-lg font-semibold mb-2">{project.title}</h3>
				<p className="text-gray-600 mb-4 line-clamp-2 text-sm">
					{project.description}
				</p>

				<ProjectDetails
					project={project}
					percentageComplete={percentageComplete}
				/>
			</div>
		</div>
	)
}

export default ProjectCard
const ProjectDetails = ({
	project,
	percentageComplete,
}: {
	project: Project
	percentageComplete: number
}) => (
	<>
		<div className="mb-4">
			<div className="flex justify-between text-sm mb-1">
				<span className="font-semibold">
					${project.current_amount?.toLocaleString()}
				</span>
				<span className="text-gray-500">
					{percentageComplete.toFixed(2)}% of $
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
				<p className="font-semibold">{project.investors_count ?? 0}</p>
				<p className="text-xs text-gray-500">Investors</p>
			</div>
			<div>
				<p className="font-semibold">${project.min_investment ?? 0}</p>
				<p className="text-xs text-gray-500">Min. Investment</p>
			</div>
		</div>

		<RenderTags tags={project.tags} />
	</>
)
