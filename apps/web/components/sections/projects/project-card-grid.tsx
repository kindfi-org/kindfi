'use client'

import { motion } from 'framer-motion'

import { Badge } from '~/components/base/badge'
import { cardHover, progressBarAnimation } from '~/lib/constants/animations'
import type { Project } from '~/lib/types/project'
import { cn } from '~/lib/utils'
import { getTextColor } from '~/lib/utils/color-utils'
import { CategoryBadge } from './category-badge'

interface ProjectCardGridProps {
	project: Project
}

export function ProjectCardGrid({ project }: ProjectCardGridProps) {
	const progressPercentage = Math.min(
		Math.round((project.raised / project.goal) * 100),
		100,
	)

	return (
		<motion.article
			className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col h-full"
			whileHover={cardHover}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<div className="relative h-48 overflow-hidden">
				<img
					src={project.image || '/images/placeholder.png'}
					alt={`${project.title} project thumbnail`}
					className="w-full h-full object-cover"
				/>
				{project.category && (
					<div className="absolute top-3 left-3">
						<CategoryBadge category={project.category} />
					</div>
				)}
			</div>

			<div className="p-5 flex flex-col flex-grow">
				<h3 className="text-xl font-bold mb-2 line-clamp-1">{project.title}</h3>
				<p className="text-muted-foreground mb-4 text-sm line-clamp-2">
					{project.description}
				</p>

				<div
					className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2"
					role="progressbar"
					tabIndex={0}
					aria-valuenow={progressPercentage}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label={`${progressPercentage}% funded`}
				>
					<motion.div
						className="h-full rounded-full gradient-progress"
						custom={progressPercentage}
						variants={progressBarAnimation}
						initial="initial"
						animate="animate"
					/>
				</div>

				<div className="flex justify-between text-sm text-gray-500 mb-3">
					<span>${project.raised.toLocaleString()} raised</span>
					<span>{progressPercentage}%</span>
				</div>

				<div className="grid grid-cols-3 gap-2 mb-3">
					<div className="text-center">
						<p className="font-bold">${project.goal.toLocaleString()}</p>
						<p className="text-xs text-gray-500">Goal</p>
					</div>
					<div className="text-center">
						<p className="font-bold">{project.investors}</p>
						<p className="text-xs text-gray-500">Supporters</p>
					</div>
					<div className="text-center">
						<p className="font-bold">${project.minInvestment}</p>
						<p className="text-xs text-gray-500">Minimum Donation</p>
					</div>
				</div>

				<div className="flex flex-wrap gap-1" aria-label="Project tags">
					{project.tags.map((tag) => {
						const bg = tag.color || '#ccc' // fallback
						const textColor = getTextColor(bg)

						return (
							<Badge
								key={tag.id}
								className={cn(
									'uppercase',
									textColor === 'white' ? 'text-white' : 'text-black',
								)}
								style={{ backgroundColor: bg }}
							>
								{tag.name}
							</Badge>
						)
					})}
				</div>
			</div>
		</motion.article>
	)
}
