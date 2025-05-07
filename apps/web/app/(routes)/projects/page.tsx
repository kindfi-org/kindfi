import { ProjectsView } from '~/components/sections/projects'
import { categories } from '~/lib/mock-data/project/categories.mock'
import { projects } from '~/lib/mock-data/project/projects.mock'

export default function ProjectsPage() {
	return (
		<main className="container mx-auto p-4 md:p-12">
			<div className="mb-8">
				<h1 className="text-4xl md:text-5xl font-bold mb-4 py-2 text-center gradient-text">
					Causes that change lives
				</h1>
				<p className="text-xl text-muted-foreground text-center">
					KindFi brings together projects driven by people committed to making
					the world better. With your support, every idea can become a concrete
					solution with lasting impact.
				</p>
			</div>

			<ProjectsView initialProjects={projects} categories={categories} />
		</main>
	)
}
