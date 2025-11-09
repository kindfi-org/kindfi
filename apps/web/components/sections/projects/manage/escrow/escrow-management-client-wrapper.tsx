'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { notFound } from 'next/navigation'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { EscrowManagementPanel } from './escrow-management-panel'

export function EscrowManagementClientWrapper({
	projectSlug,
}: {
	projectSlug: string
}) {
	const { data: project, error } = useSupabaseQuery(
		'basic-project-info',
		(client) => getBasicProjectInfoBySlug(client, projectSlug),
		{ additionalKeyValues: [projectSlug] },
	)

	if (error || !project) notFound()

	if (!project.escrowContractAddress) {
		return (
			<div className="space-y-4 rounded-lg border p-6">
				<h2 className="text-xl font-semibold">No Escrow Found</h2>
				<p className="text-sm text-muted-foreground">
					This project doesn't have an escrow contract yet. Please create one
					from the settings page.
				</p>
			</div>
		)
	}

	return (
		<EscrowManagementPanel
			projectId={project.id}
			escrowContractAddress={project.escrowContractAddress}
			escrowType={project.escrowType}
		/>
	)
}

