import { motion } from 'framer-motion'
import Image from 'next/image'
import { Progress } from '~/components/base/progress'
import type { Project } from '~/lib/types/projects.types'

interface ProjectsGridProps {
	projects: Project[]
	viewMode?: 'grid' | 'list'
}

export function ProjectsGrid({
	projects,
	viewMode = 'grid',
}: ProjectsGridProps) {
	return (
		<div
			className={
				viewMode === 'grid'
					? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
					: 'flex flex-col gap-4'
			}
		>
			{projects.map((project) => (
				<motion.div
					key={project.id}
					layout
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					transition={{ duration: 0.3 }}
					className="w-full"
				>
					<ProjectCard project={project} viewMode={viewMode} />
				</motion.div>
			))}
		</div>
	)
}

interface ProjectCardProps {
	project: Project
	viewMode?: 'grid' | 'list'
}

function ProjectCard({ project, viewMode = 'grid' }: ProjectCardProps) {
	const progressPercentage = (project.currentAmount / project.goalAmount) * 100

	if (viewMode === 'list') {
		return (
			<div className="overflow-hidden transition-shadow duration-300 rounded-lg border border-gray-100 bg-white flex">
				{/* Project Image (for list view) */}
				<div className="relative h-auto w-[200px] min-h-[180px]">
					<Image
						src={project.imageUrl || '/api/placeholder/400/320'}
						alt={project.title}
						fill
						className="object-cover"
					/>
				</div>

				{/* Project Content */}
				<div className="flex-1 p-5">
					<h3 className="text-lg font-semibold mb-2">{project.title}</h3>
					<p className="text-gray-600 mb-4 line-clamp-2 text-sm">
						{project.description}
					</p>

					{/* Funding Progress */}
					<div className="mb-4">
						<div className="flex justify-between text-sm mb-1">
							<span className="font-semibold">
								${project.currentAmount.toLocaleString()}
							</span>
							<span className="text-gray-500">
								{progressPercentage.toFixed(0)}% of $
								{project.goalAmount.toLocaleString()}
							</span>
						</div>
						<Progress value={progressPercentage} className="h-2 bg-gray-100" />
					</div>

					{/* Stats Row */}
					<div className="flex justify-between mb-4 text-center">
						<div>
							<p className="font-semibold">
								${project.currentAmount.toLocaleString()}
							</p>
							<p className="text-xs text-gray-500">Goal</p>
						</div>
						<div>
							<p className="font-semibold">{project.supporters}</p>
							<p className="text-xs text-gray-500">Supporters</p>
						</div>
						<div>
							<p className="font-semibold">${project.minSupport}</p>
							<p className="text-xs text-gray-500">Min. Support</p>
						</div>
					</div>

					{/* Tags */}
					<div className="flex flex-wrap gap-2 mt-4">
						{project.tags.map((tag) => (
							<span
								key={tag}
								className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded uppercase"
							>
								{tag}
							</span>
						))}
					</div>
				</div>
			</div>
		)
	}

	// Grid view
	return (
		<div className="overflow-hidden transition-shadow duration-300 rounded-lg border border-gray-100 bg-white h-full">
			{/* Category Badge */}
			<div className="absolute top-4 left-4 z-10">
				<span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
					{project.categories[0]}
				</span>
			</div>

			{/* Project Image */}
			<div className="relative w-full h-48">
				<Image
					src={project.imageUrl || '/api/placeholder/400/320'}
					alt={project.title}
					fill
					className="object-cover"
				/>
			</div>

			{/* Project Content */}
			<div className="p-5">
				<h3 className="text-lg font-semibold mb-2">{project.title}</h3>
				<p className="text-gray-600 mb-4 line-clamp-2 text-sm">
					{project.description}
				</p>

				{/* Funding Progress */}
				<div className="mb-4">
					<div className="flex justify-between text-sm mb-1">
						<span className="font-semibold">
							${project.currentAmount.toLocaleString()}
						</span>
						<span className="text-gray-500">
							{progressPercentage.toFixed(0)}% of $
							{project.goalAmount.toLocaleString()}
						</span>
					</div>
					<Progress value={progressPercentage} className="h-2 bg-gray-100" />
				</div>

				{/* Stats Row */}
				<div className="flex justify-between mb-4 text-center">
					<div>
						<p className="font-semibold">
							${project.currentAmount.toLocaleString()}
						</p>
						<p className="text-xs text-gray-500">Goal</p>
					</div>
					<div>
						<p className="font-semibold">{project.supporters}</p>
						<p className="text-xs text-gray-500">Supporters</p>
					</div>
					<div>
						<p className="font-semibold">${project.minSupport}</p>
						<p className="text-xs text-gray-500">Min. Support</p>
					</div>
				</div>

				{/* Tags */}
				<div className="flex flex-wrap gap-2 mt-4">
					{project.tags.map((tag) => (
						<span
							key={tag}
							className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded uppercase"
						>
							{tag}
						</span>
					))}
				</div>
			</div>
		</div>
	)
}
