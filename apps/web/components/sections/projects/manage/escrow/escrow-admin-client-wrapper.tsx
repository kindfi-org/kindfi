'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { notFound } from 'next/navigation'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { EscrowAdminPanel } from './escrow-admin-panel'

export function EscrowAdminClientWrapper({
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

	return (
		<EscrowAdminPanel
			projectId={project.id}
			projectSlug={projectSlug}
			escrowContractAddress={project.escrowContractAddress}
			escrowType={project.escrowType}
		/>
	)
}
