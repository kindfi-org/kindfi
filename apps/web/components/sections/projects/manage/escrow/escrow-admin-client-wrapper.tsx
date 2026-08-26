'use client'

import { notFound } from 'next/navigation'
import { ManageSectionShell } from '~/components/sections/projects/manage/manage-section-shell'
import { useManagedProjectQuery } from '~/hooks/projects/use-managed-project-query'
import { useI18n } from '~/lib/i18n/context'
import type { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { EscrowAdminPanel } from './escrow-admin-panel'

export function EscrowAdminClientWrapper({ projectSlug }: { projectSlug: string }) {
	const { t } = useI18n()
	const {
		data: project,
		isLoading,
		error,
	} = useManagedProjectQuery<Awaited<ReturnType<typeof getBasicProjectInfoBySlug>>>(
		'basic-project-info',
		projectSlug,
		'basic-info',
		{ additionalKeyValues: [projectSlug] },
	)

	if (isLoading) {
		return (
			<div className="space-y-6" aria-live="polite">
				<div className="h-16 animate-pulse rounded-xl bg-muted" />
				<div className="h-64 animate-pulse rounded-xl bg-muted" />
			</div>
		)
	}

	if (error || !project) notFound()

	return (
		<ManageSectionShell
			title={t('projects.manage.escrowSetupTitle')}
			description={t('projects.manage.escrowSetupDescription').replace('{title}', project.title)}
			className="mx-auto max-w-4xl"
		>
			<EscrowAdminPanel
				projectId={project.id}
				projectSlug={projectSlug}
				projectTitle={project.title}
				projectDescription={project.description}
				escrowType={project.escrowType}
			/>
		</ManageSectionShell>
	)
}
