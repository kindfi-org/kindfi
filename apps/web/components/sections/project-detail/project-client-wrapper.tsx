'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { notFound } from 'next/navigation'
import { getProjectById } from '~/lib/queries/projects'
import { BreadcrumbContainer } from './breadcrumb-container'
import { ProjectHero } from './project-hero'
import { ProjectSidebar } from './project-sidebar'
import { ProjectTabs } from './project-tabs'
import {
	BreadcrumbSkeleton,
	ProjectHeroSkeleton,
	ProjectSidebarSkeleton,
	ProjectTabsSkeleton,
} from './skeletons'

interface ProjectClientWrapperProps {
	projectId: string
}

export function ProjectClientWrapper({ projectId }: ProjectClientWrapperProps) {
	const {
		data: project,
		isLoading,
		error,
	} = useSupabaseQuery(
		'project',
		(client) => getProjectById(client, projectId),
		{
			additionalKeyValues: [projectId],
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
