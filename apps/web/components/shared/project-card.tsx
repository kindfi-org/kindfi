import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'
import { Progress } from '../base/progress'

export interface Tag {
	id: string | number
	text: string
	color?: {
		backgroundColor: string
		textColor: string
	}
}

interface Creator {
	id: number | string
	name: string
	image: string
	verified: boolean
	completedProjects: number
}

export interface Project {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	[x: string]: any
	id: string | number
	title: string
	description: string
	currentAmount: number
	targetAmount: number
	investors: number
	minInvestment?: number
	percentageComplete?: number
	tags: Tag[] | string[]
	image?: string
	imageUrl?: string
	location?: string
	category?: string
	raised?: number
	goal?: number
	donors?: number
	milestones?: number
	completedMilestones?: number
	trending?: boolean
	featured?: boolean
	creator?: Creator
}
interface ProjectCardProps {
	project: Project
	viewMode?: 'grid' | 'list'
}

// Extracted the shared tag rendering logic
const RenderTags = ({ tags }: { tags: (Tag | string)[] }) => {
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
							: {
									backgroundColor: tag.color?.backgroundColor ?? '',
									color: tag.color?.textColor ?? '',
							  }
					}
				>
					{typeof tag === 'string' ? tag : tag.text}
				</span>
			))}
		</div>
	)
}

const ProjectCard: React.FC<ProjectCardProps> = ({
	project,
	viewMode = 'grid',
}) => {
	const targetAmount = project.targetAmount ?? project.goal
	const percentageComplete =
		project.percentageComplete ??
		(project.currentAmount && project.targetAmount
			? (project.currentAmount / project.targetAmount) * 100
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

						<RenderTags tags={project.tags} />
					</div>
				</div>
			) : (
				<div className="overflow-hidden transition-shadow duration-300 rounded-lg border border-gray-100 bg-white h-full relative hover:shadow-lg">
					<div className="absolute top-4 left-4 z-10">
						<span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
							{project.category}
						</span>
					</div>

					<div className="relative w-full h-48">
						<Image
							src={project.image || '/api/placeholder/400/320'}
							alt={project.title}
							fill
							className="object-cover"
						/>
					</div>

					<div className="p-5">
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
					</div>
				</div>
			)}
		</>
	)

	return (
		<Link href={`/project/${project.id}`} className="block h-full">
			{cardContent}
		</Link>
	)
}

export default ProjectCard
