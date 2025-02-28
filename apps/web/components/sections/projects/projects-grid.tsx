import { motion } from 'framer-motion'
import ProjectCard, { Project } from '~/components/shared/project-card'


interface ProjectsGridProps {
	projects: Project[]
	viewMode?: 'grid' | 'list'
}

export function ProjectsGrid({
	projects,
	viewMode,
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
					<ProjectCard key={project.id} project={project} viewMode={viewMode} />
				</motion.div>
			))}
		</div>
	)
}