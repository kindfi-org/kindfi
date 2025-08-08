'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { notFound } from 'next/navigation'
import { BreadcrumbContainer } from '~/components/sections/projects/shared'
import { getProjectPitchDataBySlug } from '~/lib/queries/projects/get-project-pitch-data-by-slug'
import { BreadcrumbSkeleton } from '../detail/skeletons'
import { ProjectPitchForm } from './project-pitch-form'
import { ProjectPitchFormSkeleton } from './skeleton'
import { TipsSidebar } from './tips-sidebar'

interface ProjectPitchWrapperProps {
	projectSlug: string
}

export function ProjectPitchWrapper({ projectSlug }: ProjectPitchWrapperProps) {
	const {
		data: project,
		isLoading,
		error,
	} = useSupabaseQuery(
		'project-pitch',
		(client) => getProjectPitchDataBySlug(client, projectSlug),
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
						subSection="Pitch"
					/>
				)}
				<div className="inline-flex items-center px-4 py-2 rounded-full font-medium text-purple-600 bg-purple-100 border-transparent mb-4">
					Project Management
				</div>
				<h1 className="text-3xl md:text-4xl font-bold mb-4 py-2 sm:text-center gradient-text">
					Project Pitch
				</h1>
				<p className="text-xl text-muted-foreground max-w-5xl mx-auto">
					Create a compelling pitch that showcases your project's impact and
					inspires supporters to join your mission.
				</p>
			</div>
			<section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
				<div className="lg:col-span-2">
					{isLoading ? (
						<ProjectPitchFormSkeleton />
					) : (
						<ProjectPitchForm
							projectId={project.id}
							projectSlug={project.slug}
							pitch={project.pitch}
						/>
					)}
				</div>
				<aside className="lg:col-span-1">
					<TipsSidebar />
				</aside>
			</section>
		</>
	)
}
