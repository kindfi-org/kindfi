'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { ManageSectionShell } from '~/components/sections/projects/manage/manage-section-shell'
import { useManagedProjectQuery } from '~/hooks/projects/use-managed-project-query'
import { useI18n } from '~/lib/i18n/context'
import type { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { SyncEscrowCard } from './components/sync-escrow-card'
import { EscrowManagementPanel } from './escrow-management-panel'

export function EscrowManagementClientWrapper({ projectSlug }: { projectSlug: string }) {
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

	if (!project.escrowContractAddress) {
		return (
			<ManageSectionShell
				title={t('projects.manage.escrowOpsTitle')}
				description={t('projects.manage.escrowOpsEmptyDescription')}
				className="mx-auto max-w-2xl"
			>
				<Card className="border-border">
					<CardHeader>
						<CardTitle>{t('projects.manage.escrowNoContractTitle')}</CardTitle>
						<CardDescription>{t('projects.manage.escrowNoContractDescription')}</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link href={`/projects/${projectSlug}/manage/settings`}>
								{t('projects.manage.createEscrow')}
								<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
							</Link>
						</Button>
					</CardContent>
				</Card>
				<SyncEscrowCard projectId={project.id} projectSlug={projectSlug} />
			</ManageSectionShell>
		)
	}

	return (
		<ManageSectionShell
			title={t('projects.manage.escrowOpsTitle')}
			description={t('projects.manage.escrowOpsDescription').replace('{title}', project.title)}
			className="mx-auto max-w-4xl"
		>
			<EscrowManagementPanel
				projectId={project.id}
				escrowContractAddress={project.escrowContractAddress}
				escrowType={project.escrowType}
			/>
		</ManageSectionShell>
	)
}
