'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Button } from '~/components/base/button'
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
import { useI18n } from '~/lib/i18n'
import {
	fetchProjectDetail,
	resolveProjectDetailViewState,
} from '~/lib/utils/projects/project-detail-state'

interface ProjectClientWrapperProps {
	projectSlug: string
}

export function ProjectClientWrapper({ projectSlug }: ProjectClientWrapperProps) {
	const { language, t } = useI18n()
	const {
		data: project,
		isLoading,
		isError,
		isFetching,
		refetch,
	} = useQuery({
		queryKey: ['project', projectSlug, language],
		queryFn: () => fetchProjectDetail(projectSlug),
		staleTime: 60_000,
	})

	const viewState = resolveProjectDetailViewState({
		data: project,
		isLoading,
		isError,
	})

	if (viewState === 'loading') {
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

	if (viewState === 'not-found') {
		notFound()
	}

	if (viewState === 'error') {
		return (
			<div
				role="alert"
				aria-live="assertive"
				className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center"
			>
				<AlertCircle className="size-10 text-destructive" aria-hidden="true" />
				<div className="space-y-1">
					<h2 className="text-lg font-semibold">{t('projects.detail.errorTitle')}</h2>
					<p className="max-w-md text-sm text-muted-foreground">
						{t('projects.detail.errorDescription')}
					</p>
				</div>
				<Button
					variant="outline"
					onClick={() => {
						void refetch()
					}}
					disabled={isFetching}
					startIcon={
						<RefreshCw className={isFetching ? 'animate-spin' : undefined} aria-hidden="true" />
					}
				>
					{isFetching ? t('projects.detail.errorRetrying') : t('projects.detail.errorRetry')}
				</Button>
			</div>
		)
	}

	// viewState === 'content' — `project` is guaranteed to be defined here.
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
