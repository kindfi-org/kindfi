'use client'

import { Plus } from 'lucide-react'
import { Button } from '~/components/base/button'
import { TooltipProvider } from '~/components/base/tooltip'
import { EscrowBasicFields } from './components/escrow-basic-fields'
import { EscrowMilestones } from './components/escrow-milestones'
import { EscrowRoleFields } from './components/escrow-role-fields'
import { EscrowTypeSelector } from './components/escrow-type-selector'
import { useEscrowForm } from './context/escrow-form-context'
import { useEscrowValidation } from './hooks/use-escrow-validation'
import { useEscrowTransaction } from './hooks/use-escrow-transaction'
import { useWalletSync } from './hooks/use-wallet-sync'

interface EscrowAdminPanelContentProps {
	projectId: string
	projectSlug: string
	suggestedTitle: string
	suggestedEngagementId: string
	suggestedDescription: string
}

export function EscrowAdminPanelContent({
	projectId,
	projectSlug,
	suggestedTitle,
	suggestedEngagementId,
	suggestedDescription,
}: EscrowAdminPanelContentProps) {
	const { formData } = useEscrowForm()

	useWalletSync({ suggestedTitle, suggestedEngagementId, suggestedDescription })

	const isValid = useEscrowValidation(formData, projectId)
	const { handleCreateEscrow, isSubmitting } = useEscrowTransaction({
		projectId,
		projectSlug,
	})

	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold">Escrow Admin</h1>
			<TooltipProvider>
				<div className="space-y-6">
					<div className="space-y-2">
						<div className="flex gap-2 items-center">
							<h2 className="text-lg font-semibold">
								Fill in the details of the Escrow
							</h2>
						</div>
						<p className="text-sm text-muted-foreground">
							Fill in the details below to set up a secure and reliable escrow
							agreement.
						</p>
					</div>

					<div className="grid gap-6">
						<EscrowTypeSelector />
						<EscrowBasicFields projectId={projectId} />
						<EscrowRoleFields />
						<EscrowMilestones />

						<div className="flex gap-3 pt-4">
							<Button
								onClick={() => handleCreateEscrow(formData)}
								disabled={!isValid || isSubmitting}
								className="px-6 py-2 font-semibold text-white bg-gradient-to-r rounded-lg shadow-md transition-colors duration-200 from-primary to-secondary hover:from-secondary hover:to-primary disabled:opacity-60 disabled:cursor-not-allowed"
								size="lg"
							>
								<Plus className="mr-2 w-4 h-4" />
								{isSubmitting ? 'Initializing…' : 'Initialize Escrow'}
							</Button>
						</div>
					</div>
				</div>
			</TooltipProvider>

			<div className="h-px bg-gray-200" />
		</div>
	)
}
