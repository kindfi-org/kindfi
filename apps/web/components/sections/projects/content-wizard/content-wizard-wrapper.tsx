'use client'

import { ContentWizardProvider } from '~/hooks/contexts/use-content-wizard.context'
import { useManagedProjectQuery } from '~/hooks/projects/use-managed-project-query'
import type { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import type { getProjectHighlights } from '~/lib/queries/projects/get-project-highlights'
import type { getProjectPitchDataBySlug } from '~/lib/queries/projects/get-project-pitch-data-by-slug'
import { buildContentWizardFormData } from '~/lib/utils/build-content-wizard-form-data'
import { ContentWizard } from './content-wizard'

type ContentWizardWrapperProps = {
	slug: string
}

export function ContentWizardWrapper({ slug }: ContentWizardWrapperProps) {
	const { data: project, isLoading: isLoadingProject } = useManagedProjectQuery<
		Awaited<ReturnType<typeof getBasicProjectInfoBySlug>>
	>('basic-project-info', slug, 'basic-info', { additionalKeyValues: [slug] })

	const { data: pitchData, isLoading: isLoadingPitch } = useManagedProjectQuery<
		Awaited<ReturnType<typeof getProjectPitchDataBySlug>>
	>('project-pitch', slug, 'pitch', { additionalKeyValues: [slug] })

	const { data: highlights, isLoading: isLoadingHighlights } = useManagedProjectQuery<
		Awaited<ReturnType<typeof getProjectHighlights>>
	>('project-highlights', slug, 'highlights', { additionalKeyValues: [slug] })

	if (isLoadingProject || isLoadingPitch || isLoadingHighlights || !project) {
		return (
			<div className="mx-auto max-w-3xl space-y-4 py-8" aria-live="polite">
				<div className="h-10 animate-pulse rounded-lg bg-muted" />
				<div className="h-64 animate-pulse rounded-xl bg-muted" />
			</div>
		)
	}

	const initialData = buildContentWizardFormData({
		project,
		pitch: pitchData?.pitch ?? null,
		highlights: highlights ?? null,
	})

	return (
		<ContentWizardProvider
			mode="manage"
			initialData={initialData}
			projectId={project.id}
			projectSlug={slug}
			defaultSourceLocale={project.sourceLocale ?? 'en'}
		>
			<ContentWizard />
		</ContentWizardProvider>
	)
}
