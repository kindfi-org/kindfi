import { notFound } from 'next/navigation'

import { UpdateProjectForm } from '~/components/sections/projects/create/update-project-form'
import type { CreateProjectFormData } from '~/lib/types/project/create-project.types'

// Mock data
const projectData: CreateProjectFormData = {
	id: '1',
	title: 'Empowering Education',
	description:
		'Support education programs for children in low-income areas. Together, we can bridge the education gap and create opportunities for all children regardless of their background.',
	targetAmount: 55000,
	minimumInvestment: 10,
	image: null,
	website: 'https://empoweringeducation.org',
	socialLinks: [
		'https://twitter.com/empowereducation',
		'https://facebook.com/empoweringeducation',
		'https://instagram.com/empowereducation',
	],
	location: 'CRI', // Costa Rica
	category: '7', // Education
	tags: ['EDUCATION', 'CHILDREN', 'FUTURE'],
}

export default async function UpdateProjectPage({
	params,
}: {
	params: Promise<{
		id: string
	}>
}) {
	const { id } = await params

	if (id !== projectData.id) {
		notFound()
	}

	return (
		<main className="container mx-auto px-4 py-8 md:py-12">
			<div className="text-center mb-8">
				<h1 className="text-3xl md:text-4xl font-bold mb-4 py-2 sm:text-center gradient-text">
					Update Project Basics
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					Update your project's core information and social media presence.
				</p>
			</div>

			<UpdateProjectForm projectData={projectData} />
		</main>
	)
}
