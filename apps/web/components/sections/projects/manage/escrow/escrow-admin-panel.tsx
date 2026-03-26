'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { EscrowFormProvider } from './context/escrow-form-context'
import { EscrowAdminPanelContent } from './escrow-admin-panel-content'
import { useProjectDefaults } from './hooks/use-project-defaults'

export function EscrowAdminPanel({
	projectId,
	projectSlug,
	projectTitle,
	projectDescription,
	escrowType,
}: {
	projectId: string
	projectSlug: string
	projectTitle?: string
	projectDescription?: string
	escrowContractAddress?: string
	escrowType?: EscrowType
}) {
	const { suggestedTitle, suggestedEngagementId, suggestedDescription } =
		useProjectDefaults({ projectId, projectTitle, projectDescription })

	return (
		<EscrowFormProvider
			initialData={{
				selectedEscrowType: escrowType ?? 'multi-release',
				title: suggestedTitle,
				engagementId: suggestedEngagementId,
				description: suggestedDescription,
			}}
		>
			<EscrowAdminPanelContent
				projectId={projectId}
				projectSlug={projectSlug}
				suggestedTitle={suggestedTitle}
				suggestedEngagementId={suggestedEngagementId}
				suggestedDescription={suggestedDescription}
			/>
		</EscrowFormProvider>
	)
}
