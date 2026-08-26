'use client'

import { EscrowFormProvider } from './context/escrow-form-context'
import { EscrowAdminPanelContent } from './escrow-admin-panel-content'
import { useProjectDefaults } from './hooks/use-project-defaults'
import type { EscrowAdminPanelProps } from './types'

export function EscrowAdminPanel({
	projectId,
	projectSlug,
	projectTitle,
	projectDescription,
	escrowType,
}: EscrowAdminPanelProps) {
	const { suggestedTitle, suggestedEngagementId, suggestedDescription } = useProjectDefaults({
		projectId,
		projectSlug,
		projectTitle,
		projectDescription,
	})

	return (
		<EscrowFormProvider
			initialData={{
				selectedEscrowType: escrowType ?? 'multi-release',
				title: suggestedTitle,
				engagementId: suggestedEngagementId,
				description: suggestedDescription,
				suggestedTitle,
				suggestedEngagementId,
				suggestedDescription,
			}}
		>
			<EscrowAdminPanelContent projectId={projectId} projectSlug={projectSlug} />
		</EscrowFormProvider>
	)
}
