'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { notFound } from 'next/navigation'
import { BreadcrumbContainer } from '~/components/sections/projects/shared'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { BreadcrumbSkeleton } from '../detail/skeletons'
import { UpdateProjectFormSkeleton } from './skeletons'
import { UpdateProjectForm } from './update-project-form'

interface UpdateProjectWrapperProps {
	projectSlug: string
}

export function UpdateProjectWrapper({
	projectSlug,
}: UpdateProjectWrapperProps) {
	const {
		data: project,
		isLoading,
		error,
	} = useSupabaseQuery(
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, projectSlug),
		{ additionalKeyValues: [projectSlug] },
	)

	if (error || !project) notFound()

	const category = project.category?.slug
		? { name: project.category.name, slug: project.category.slug }
		: undefined

	return (
		<>
			<div className="flex flex-col items-center justify-center mb-8">
				{isLoading ? (
					<BreadcrumbSkeleton />
				) : (
					<BreadcrumbContainer
						category={category}
						title={project.title}
						manageSection="Project Management"
						subSection="Basics"
					/>
				)}
				<h1 className="text-3xl md:text-4xl font-bold mb-4 py-2 sm:text-center gradient-text">
					Edit Project Basics
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					Update your project's core information and social media presence.
				</p>
			</div>
			{isLoading ? (
				<UpdateProjectFormSkeleton />
			) : (
				<UpdateProjectForm project={project} />
			)}
		</>
	)
}
