import { AnimatePresence, motion } from 'framer-motion'
import { EmptyProject } from '~/components/sections/projects/empty-project'
import ProjectCard from '~/components/shared/project-card'
import type { Project } from '~/lib/types/projects.types'
import { cn } from '~/lib/utils'

interface ProjectsGridProps {
	projects: Project[]
	viewMode?: 'grid' | 'list'
	selectedCategories?: string[]
	onClearFilters?: () => void
	/**
	 * Set of project IDs that were added in the latest page-load.
	 * Only these IDs receive enter animations; already-rendered cards are static.
	 */
	newIds?: ReadonlySet<string | number>
}

export function ProjectsGrid({
	projects,
	viewMode = 'grid',
	selectedCategories = [],
	onClearFilters = () => {},
	newIds = new Set(),
}: ProjectsGridProps) {
	// Check if we have projects to display
	const hasProjects = projects && projects.length > 0

	return (
		<AnimatePresence mode="wait">
			{!hasProjects ? (
				<motion.div
					key="empty-state"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<EmptyProject selectedCategories={selectedCategories} onClearFilters={onClearFilters} />
				</motion.div>
			) : (
				<div
					className={cn(
						viewMode === 'grid'
							? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
							: 'flex flex-col gap-4',
						'mt-8',
					)}
				>
					{projects.map((project) =>
						newIds.has(project.id) ? (
							// Only newly-loaded cards get an enter animation — avoids
							// re-animating the entire list on every page append.
							<motion.div
								key={project.id}
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
								className="w-full"
							>
								<ProjectCard project={project} viewMode={viewMode} />
							</motion.div>
						) : (
							// Cards already on screen render as plain divs — zero layout cost.
							<div key={project.id} className="w-full">
								<ProjectCard project={project} viewMode={viewMode} />
							</div>
						),
					)}
				</div>
			)}
		</AnimatePresence>
	)
}
