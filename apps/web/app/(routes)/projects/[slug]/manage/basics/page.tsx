import { notFound } from 'next/navigation'

import { UpdateProjectForm } from '~/components/sections/projects/create/update-project-form'
import { BreadcrumbContainer } from '~/components/sections/projects/shared'
import { project } from '~/lib/mock-data/project/create-project.mock'

export default async function UpdateProjectPage({
	params,
}: {
	params: Promise<{
		slug: string
	}>
}) {
	const { slug } = await params

	if (slug !== project.slug) {
		notFound()
	}

	return (
		<main className="container mx-auto px-4 py-8 md:py-12">
			<div className="flex flex-col items-center justify-center mb-8">
				<BreadcrumbContainer
					category={{ name: 'Education', slug: 'education' }}
					title="Empowering Education"
					manageSection="Project Management"
					subSection="Basics"
				/>
				<h1 className="text-3xl md:text-4xl font-bold mb-4 py-2 sm:text-center gradient-text">
					Edit Project Basics
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					Update your project's core information and social media presence.
				</p>
			</div>

			<UpdateProjectForm project={project} />
		</main>
	)
}
