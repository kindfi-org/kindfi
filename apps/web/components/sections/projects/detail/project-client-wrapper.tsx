'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { notFound } from 'next/navigation'
import { ProjectHero } from '~/components/sections/projects/detail/project-hero'
import { ProjectSidebar } from '~/components/sections/projects/detail/project-sidebar'
import { ProjectTabs } from '~/components/sections/projects/detail/project-tabs'
import {
	BreadcrumbSkeleton,
	ProjectHeroSkeleton,
	ProjectSidebarSkeleton,
	ProjectTabsSkeleton,
} from '~/components/sections/projects/detail/skeletons'
import { BreadcrumbContainer } from '~/components/sections/projects/shared'
import { getProjectBySlug } from '~/lib/queries/projects'

interface ProjectClientWrapperProps {
	projectSlug: string
}

export function ProjectClientWrapper({
	projectSlug,
}: ProjectClientWrapperProps) {
	const {
		data: project,
		isLoading,
		error,
	} = useSupabaseQuery(
		'project',
		(client) => getProjectBySlug(client, projectSlug),
		{
			additionalKeyValues: [projectSlug],
		},
	)

	if (error || !project) notFound()

	const category = project.category?.slug
		? { name: project.category.name, slug: project.category.slug }
		: undefined

	return (
		<>
			<div className="mb-6">
				{isLoading ? (
					<BreadcrumbSkeleton />
				) : (
					<BreadcrumbContainer title={project.title} category={category} />
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					{isLoading ? (
						<>
							<ProjectHeroSkeleton />
							<ProjectTabsSkeleton />
						</>
					) : (
						<>
							<ProjectHero project={project} />
							<ProjectTabs project={project} />
						</>
					)}
				</div>

				<div className="lg:col-span-1">
					{isLoading ? (
						<ProjectSidebarSkeleton />
					) : (
						<ProjectSidebar project={project} />
					)}
				</div>
			</div>
		</>
	)
}
