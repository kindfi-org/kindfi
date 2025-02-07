'use client'

import type { Project } from './mock-data'
import { ProjectCard } from './project-card'

interface ProjectGridProps {
	projects: Project[]
}

export function ProjectGrid({ projects }: ProjectGridProps) {
	return (
		<div
			className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
			aria-label="Projects grid"
		>
			{projects.length === 0 ? (
				<p className="col-span-full text-center text-gray-500">
					No projects found
				</p>
			) : (
				projects.map((project) => (
					<ProjectCard key={project.id} project={project} />
				))
			)}
		</div>
	)
}
