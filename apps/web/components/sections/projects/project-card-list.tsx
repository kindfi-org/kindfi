'use client'

import { motion } from 'framer-motion'

import { Badge } from '~/components/base/badge'
import { cardHover, progressBarAnimation } from '~/lib/constants/animations'
import type { Project } from '~/lib/types/project'
import { cn } from '~/lib/utils'
import { getTextColor } from '~/lib/utils/color-utils'
import { CategoryBadge } from './category-badge'

interface ProjectCardListProps {
	project: Project
}

export function ProjectCardList({ project }: ProjectCardListProps) {
	const progressPercentage = Math.min(
		Math.round((project.raised / project.goal) * 100),
		100,
	)

	return (
		<motion.article
			className="bg-white rounded-lg overflow-hidden shadow-md flex flex-row h-full"
			whileHover={cardHover}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			{/* Image section - responsive width */}
			<div className="relative w-1/4 min-w-[100px] max-w-[180px] overflow-hidden">
				<img
					src={project.image || '/images/placeholder.png'}
					alt={`${project.title} project thumbnail`}
					className="w-full h-full object-cover"
				/>
			</div>

			{/* Content section */}
			<div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
				<div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
					<h3 className="text-base sm:text-lg md:text-xl font-bold line-clamp-1">
						{project.title}
					</h3>
					{project.category && (
						<div className="shrink-0">
							<CategoryBadge
								category={project.category}
								className="text-xs sm:text-sm"
							/>
						</div>
					)}
				</div>

				<p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 md:mb-4 line-clamp-2">
					{project.description}
				</p>

				<div className="mt-auto space-y-2 sm:space-y-3">
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

					<div className="flex justify-between text-xs sm:text-sm text-gray-500">
						<span>${project.raised.toLocaleString()} raised</span>
						<span>{progressPercentage}%</span>
					</div>

					<div className="grid grid-cols-3 gap-1 sm:gap-2">
						<div className="text-center">
							<p className="font-bold text-xs sm:text-sm">
								${project.goal.toLocaleString()}
							</p>
							<p className="text-[10px] sm:text-xs text-gray-500">Goal</p>
						</div>
						<div className="text-center">
							<p className="font-bold text-xs sm:text-sm">
								{project.investors}
							</p>
							<p className="text-[10px] sm:text-xs text-gray-500">Investors</p>
						</div>
						<div className="text-center">
							<p className="font-bold text-xs sm:text-sm">
								${project.minInvestment}
							</p>
							<p className="text-[10px] sm:text-xs text-gray-500">
								Min. Investment
							</p>
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
			</div>
		</motion.article>
	)
}
