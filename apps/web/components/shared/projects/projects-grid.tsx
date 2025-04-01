import { AnimatePresence, motion } from 'framer-motion'
import ProjectCard from '~/components/shared/project-card'
import type { Project } from '~/lib/types/projects.types'
import { cn } from '~/lib/utils'

interface ProjectsGridProps {
	projects: Project[]
	viewMode?: 'grid' | 'list'
}

export function ProjectsGrid({ projects, viewMode }: ProjectsGridProps) {
	return (
		<AnimatePresence mode="wait">
			<div
				className={cn(
					viewMode === 'grid'
						? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
						: 'flex flex-col gap-4',
					'mt-8',
				)}
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
						<ProjectCard
							key={project.id}
							project={project}
							viewMode={viewMode}
						/>
					</motion.div>
				))}
			</div>
		</AnimatePresence>
	)
}
