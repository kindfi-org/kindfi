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
		data: rawProject,
		isLoading,
		error,
	} = useSupabaseQuery(
		'project',
		(client) => getProjectById(client, projectId),
		{
			additionalKeyValues: [projectId],
		},
	)

	if (error || !rawProject) notFound()

	const project = rawProject
		? {
				...rawProject,
				tags: rawProject.tags.map((tag) => ({
					...tag,
					color: tag.color || '#6B7280',
				})),
			}
		: undefined

	const category = project?.category?.slug
		? { name: project.category.name, slug: project.category.slug }
		: undefined

	return (
		<>
			<div className="mb-6">
				{isLoading ? (
					<BreadcrumbSkeleton />
				) : (
					<BreadcrumbContainer
						title={project?.title || ''}
						category={category}
					/>
				)}
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					{isLoading ? (
						<>
							<ProjectHeroSkeleton />
							<ProjectTabsSkeleton />
						</>
					) : project ? (
						<>
							<ProjectHero project={project} />
							<ProjectTabs project={project} />
						</>
					) : null}
				</div>
				<div className="lg:col-span-1">
					{isLoading ? (
						<ProjectSidebarSkeleton />
					) : project ? (
						<ProjectSidebar project={project} />
					) : null}
				</div>
			</div>
		</>
	)
}
