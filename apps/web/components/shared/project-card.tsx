import Image from 'next/image'
import Link from 'next/link'
import type { Project, Tag } from '~/lib/types/projects.types'
import { cn } from '~/lib/utils'
import { getTagColors } from '~/lib/utils/types-helpers'
import { Progress } from '../base/progress'

interface ProjectCardProps {
	project: Project
	viewMode?: 'grid' | 'list'
}

// Extracted the shared tag rendering logic
function RenderTags({ tags }: { tags: Tag[] | string[] }) {
	if (!Array.isArray(tags) || tags?.length === 0) return null // Prevents errors if undefined or not an array

	return (
		<div className="flex flex-wrap gap-2 mt-4">
			{tags.map((tag) => {
				const colors = getTagColors(tag)
				return (
					<span
						key={typeof tag === 'string' ? tag : tag.id}
						className="px-2 py-1 text-xs rounded uppercase"
						style={colors}
					>
						{typeof tag === 'string' ? tag : tag.text}
					</span>
				)
			})}
		</div>
	)
}

function RenderCategories({ categories }: { categories: string[] }) {
	return categories?.length ? (
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
}

function ProjectCard({ project, viewMode = 'grid' }: ProjectCardProps) {
	const percentageComplete =
		project.percentage_complete ??
		(project.current_amount >= 0 && project.target_amount > 0
			? (project.current_amount / project.target_amount) * 100
			: 0)

	const cardContent = (
		<>
			{viewMode === 'list' ? (
				<div className="overflow-hidden transition-shadow duration-300 rounded-lg border border-gray-100 bg-white flex hover:shadow-lg">
					<div className="relative h-auto w-[200px] min-h-[180px]">
						<Image
							src={project.image || '/api/placeholder/400/320'}
							alt={project.title}
							fill
							className="object-cover"
						/>
					</div>

					<div className="flex-1 p-5">
						<h3 className="text-lg font-semibold mb-2">{project.title}</h3>
						<p className="text-gray-600 mb-4 line-clamp-2 text-sm">
							{project.description}
						</p>

						<div className="mb-4">
							<div className="flex justify-between text-sm mb-1">
								<span className="font-semibold">
									${project.currentAmount?.toLocaleString()}
								</span>
								<span className="text-gray-500">
									{percentageComplete.toFixed(2)}% of $
									{targetAmount?.toLocaleString()}
								</span>
							</div>
							<Progress
								value={percentageComplete}
								className="h-2 bg-gray-100"
							/>
						</div>

						<div className="flex justify-between mb-4 text-center">
							<div>
								<p className="font-semibold">
									${project.targetAmount?.toLocaleString()}
								</p>
								<p className="text-xs text-gray-500">Goal</p>
							</div>
							<div>
								<p className="font-semibold">{project.investors ?? 0}</p>
								<p className="text-xs text-gray-500">Investors</p>
							</div>
							<div>
								<p className="font-semibold">${project.minInvestment ?? 0}</p>
								<p className="text-xs text-gray-500">Min. Investment</p>
							</div>
						</div>
	return (
		<Link href={`/project/${project.id}`} className="block h-full">
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
				'overflow-hidden transition-shadow duration-300 rounded-lg border border-gray-100 bg-white',
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
						<div className="mb-4">
							<div className="flex justify-between text-sm mb-1">
								<span className="font-semibold">
									${project.currentAmount?.toLocaleString()}
								</span>
								<span className="text-gray-500">
									{percentageComplete.toFixed(2)}% of $
									{targetAmount?.toLocaleString()}
								</span>
							</div>
							<Progress
								value={percentageComplete}
								className="h-2 bg-gray-100"
							/>
						</div>

						<div className="flex justify-between mb-4 text-center">
							<div>
								<p className="font-semibold">
									$
									{project.targetAmount
										? project.targetAmount.toLocaleString()
										: project.goal?.toLocaleString()}
								</p>
								<p className="text-xs text-gray-500">Goal</p>
							</div>
							<div>
								<p className="font-semibold">{project.investors ?? 0}</p>
								<p className="text-xs text-gray-500">Investors</p>
							</div>
							<div>
								<p className="font-semibold">${project.minInvestment ?? 0}</p>
								<p className="text-xs text-gray-500">Min. Investment</p>
							</div>
						</div>

						<RenderTags tags={project.tags} />
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
			</div>
		</div>
	)
}

export default ProjectCard
