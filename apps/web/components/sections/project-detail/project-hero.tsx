'use client'

import { motion } from 'framer-motion'
import { CategoryBadge } from '~/components/sections/projects/category-badge'
import type { Project } from '~/lib/types/project'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { AnimatedCounter } from './animated-counter'
import { ProjectOwner } from './project-owner'

interface ProjectHeroProps {
	project: Project
}

export function ProjectHero({ project }: ProjectHeroProps) {
	return (
		<motion.section
			className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
				<img
					src={project.image || '/placeholder.svg'}
					alt={`${project.title} banner`}
					className="w-full h-full object-cover"
					loading="eager"
				/>
				{project.category && (
					<div className="absolute top-4 left-4">
						<CategoryBadge category={project.category} />
					</div>
				)}
			</div>

			<div className="p-6">
				<h1 className="text-3xl md:text-4xl font-bold mb-3">{project.title}</h1>

				<p className="text-muted-foreground mb-6">{project.description}</p>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					<div className="bg-gray-50 p-4 rounded-lg text-center">
						<p className="text-sm text-muted-foreground mb-1">Raised</p>
						<p className="text-xl font-bold">
							$<AnimatedCounter value={project.raised} />
						</p>
					</div>
					<div className="bg-gray-50 p-4 rounded-lg text-center">
						<p className="text-sm text-muted-foreground mb-1">Goal</p>
						<p className="text-xl font-bold">
							$<AnimatedCounter value={project.goal} />
						</p>
					</div>
					<div className="bg-gray-50 p-4 rounded-lg text-center">
						<p className="text-sm text-muted-foreground mb-1">Supporters</p>
						<p className="text-xl font-bold">
							<AnimatedCounter value={project.investors} />
						</p>
					</div>
					<div className="bg-gray-50 p-4 rounded-lg text-center">
						<p className="text-sm text-muted-foreground mb-1">
							Minimum Donation
						</p>
						<p className="text-xl font-bold">
							$<AnimatedCounter value={project.minInvestment} />
						</p>
					</div>
				</div>

				{/* <ProjectOwner owner={project.owner} /> */}
			</div>
		</motion.section>
	)
}
