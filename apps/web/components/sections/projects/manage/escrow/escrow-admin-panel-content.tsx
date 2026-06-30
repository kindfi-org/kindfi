'use client'

import { EscrowCreationWizard } from './components/escrow-creation-wizard'

interface EscrowAdminPanelContentProps {
	projectId: string
	projectSlug: string
}

export function EscrowAdminPanelContent({ projectId, projectSlug }: EscrowAdminPanelContentProps) {
	return <EscrowCreationWizard projectId={projectId} projectSlug={projectSlug} />
}
