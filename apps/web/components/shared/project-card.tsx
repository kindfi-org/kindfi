import Image from 'next/image'
import React from 'react'
import { Progress } from '../base/progress'

export interface Tag {
	id: string | number
	text: string
	color?: {
		backgroundColor: string
		textColor: string
	}
}

interface creator {
	id: number | string
	name: string
	image: string
	verified: boolean,
	completedProjects: number
}

export interface Project {
	id: string | number
	title: string
	description: string
	image?: string
	imageUrl?: string
	location?: string
	category?: string
	currentAmount?: number
	targetAmount?: number
	investors?: number
	minInvestment?: number
	percentageComplete?: number
	tags: Tag[] | string[]
	raised?: number
	goal?: number
	donors?: number
	milestones?: number
	completedMilestones?: number
	trending?: boolean
	featured?: boolean
	creator?: creator
}

interface ProjectCardProps {
	project: Project
	viewMode?: 'grid' | 'list'
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, viewMode = 'grid' }) => {
	let percentageCompleteFixed = 0;

	if (project.currentAmount && project.targetAmount) {
		percentageCompleteFixed = (project.currentAmount / project.targetAmount) * 100;
	}

	if (viewMode === 'list') {
		return (
			<div className="overflow-hidden transition-shadow duration-300 rounded-lg border border-gray-100 bg-white flex">
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
					<p className="text-gray-600 mb-4 line-clamp-2 text-sm">{project.description}</p>

					<div className="mb-4">
						<div className="flex justify-between text-sm mb-1">
							<span className="font-semibold">${project.currentAmount?.toLocaleString()}</span>
							<span className="text-gray-500">
								{(project.percentageComplete ?? percentageCompleteFixed).toFixed(2)}% of $
								{(project.targetAmount ?? project.goal)?.toLocaleString()}
							</span>
						</div>
						<Progress value={project.percentageComplete ? project.percentageComplete : percentageCompleteFixed} className="h-2 bg-gray-100" />
					</div>

					<div className="flex justify-between mb-4 text-center">
						<div>
							<p className="font-semibold">${project.targetAmount?.toLocaleString()}</p>
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

					<div className="flex flex-wrap gap-2 mt-4">
						{(project.tags ?? []).map((tag) => {
							if (typeof tag === 'string') {
								return (
									<span
										key={tag}
										className="px-2 py-1 text-xs rounded uppercase bg-gray-200 text-gray-700"
									>
										{tag}
									</span>
								);
							} else {
								return (
									<span
										key={tag.id}
										className="px-2 py-1 text-xs rounded uppercase"
										style={{
											backgroundColor: tag.color?.backgroundColor ?? "",
											color: tag.color?.textColor ?? "",
										}}
									>
										{tag.text}
									</span>
								);
							}
						})}
					</div>
				</div>
			</div>
		)
	} else if (viewMode === 'grid') {
		return (
			<div className="overflow-hidden transition-shadow duration-300 rounded-lg border border-gray-100 bg-white h-full relative">
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
					<p className="text-gray-600 mb-4 line-clamp-2 text-sm">{project.description}</p>

					<div className="mb-4">
						<div className="flex justify-between text-sm mb-1">
							<span className="font-semibold">${project.currentAmount?.toLocaleString()}</span>
							<span className="text-gray-500">
								{(project.percentageComplete ?? percentageCompleteFixed).toFixed(2)}% of $
								{(project.targetAmount ?? project.goal)?.toLocaleString()}
							</span>
						</div>
						<Progress value={project.percentageComplete ? project.percentageComplete : percentageCompleteFixed} className="h-2 bg-gray-100" />
					</div>

					<div className="flex justify-between mb-4 text-center">
						<div>
							<p className="font-semibold">${project.targetAmount ? project.targetAmount.toLocaleString() : project.goal?.toLocaleString()}</p>
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

					<div className="flex flex-wrap gap-2 mt-4">
						{(project.tags ?? []).map((tag) => {
							if (typeof tag === 'string') {
								return (
									<span
										key={tag}
										className="px-2 py-1 text-xs rounded uppercase bg-gray-200 text-gray-700"
									>
										{tag}
									</span>
								);
							} else {
								return (
									<span
										key={tag.id}
										className="px-2 py-1 text-xs rounded uppercase"
										style={{
											backgroundColor: tag.color?.backgroundColor ?? "",
											color: tag.color?.textColor ?? "",
										}}
									>
										{tag.text}
									</span>
								);
							}
						})}

					</div>
				</div>
			</div>
		)
	}
}

export default ProjectCard;