'use client'

import { useQuery } from '@tanstack/react-query'
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
import type { getProjectBySlug } from '~/lib/queries/projects/get-project-by-slug'

interface ProjectClientWrapperProps {
	projectSlug: string
}

async function fetchProjectDetail(
	projectSlug: string,
): Promise<Awaited<ReturnType<typeof getProjectBySlug>>> {
	const response = await fetch(`/api/projects/${projectSlug}`)
	if (response.status === 404) {
		return null
	}
	if (!response.ok) {
		throw new Error('Failed to load project')
	}
	return response.json()
}

export function ProjectClientWrapper({ projectSlug }: ProjectClientWrapperProps) {
	const { data: project, isLoading } = useQuery({
		queryKey: ['project', projectSlug],
		queryFn: () => fetchProjectDetail(projectSlug),
		staleTime: 60_000,
	})

	if (isLoading) {
		return (
			<>
				<div className="mb-6">
					<BreadcrumbSkeleton />
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2">
						<ProjectHeroSkeleton />
						<ProjectTabsSkeleton />
					</div>
					<div className="lg:col-span-1">
						<ProjectSidebarSkeleton />
					</div>
				</div>
			</>
		)
	}

	if (!isLoading && !project) {
		notFound()
	}

	if (!project) {
		return null
	}

	const category = project.category?.slug
		? { name: project.category.name, slug: project.category.slug }
		: undefined

	return (
		<>
			<div className="mb-6">
				<BreadcrumbContainer title={project.title} category={category} />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					<ProjectHero project={project} projectSlug={projectSlug} />
					<ProjectTabs project={project} projectSlug={projectSlug} />
				</div>
				<div className="lg:col-span-1">
					<ProjectSidebar project={project} projectSlug={projectSlug} />
				</div>
			</div>
		</>
	)
}
