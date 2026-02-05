'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { notFound } from 'next/navigation'
import { IoSettingsOutline } from 'react-icons/io5'
import { getFoundationBySlug } from '~/lib/queries/foundations/get-foundation-by-slug'
import { ManagePageShell, ManageSectionHeader } from '../shared'

export function FoundationEscrowAdminClientWrapper({
	foundationSlug,
}: {
	foundationSlug: string
}) {
	const prefersReducedMotion = useReducedMotion()
	const {
		data: foundation,
		error,
		isLoading,
	} = useSupabaseQuery(
		'foundation',
		(client) => getFoundationBySlug(client, foundationSlug),
		{ additionalKeyValues: [foundationSlug] },
	)

	if (error ?? !foundation) {
		notFound()
	}

	if (isLoading) {
		return (
			<ManagePageShell>
				<div className="space-y-6">
					<div className="h-12 bg-muted animate-pulse rounded-lg w-1/2" />
					<p className="text-muted-foreground" aria-live="polite">
						Loading…
					</p>
					<div className="h-48 bg-muted animate-pulse rounded-lg" />
				</div>
			</ManagePageShell>
		)
	}

	const escrowContract = foundation.escrows?.[0]

	return (
		<ManagePageShell>
			<ManageSectionHeader
				icon={
					<IoSettingsOutline
						size={24}
						className="relative z-10"
						aria-hidden="true"
					/>
				}
				title="Foundation Escrow"
				description={`Manage escrow contracts for ${foundation.name}`}
			/>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{
					delay: prefersReducedMotion ? 0 : 0.2,
					duration: prefersReducedMotion ? 0 : 0.3,
					transitionProperty: 'opacity',
				}}
			>
				<div className="p-6 rounded-lg border bg-card">
					<p className="text-muted-foreground">
						Foundation escrow management coming soon. The escrow system will be
						adapted to support foundations.
					</p>
					{escrowContract ? (
						<div className="mt-4 p-4 bg-muted rounded-lg">
							<p className="text-sm font-medium">Current Escrow Contract:</p>
							<p className="text-xs text-muted-foreground font-mono">
								{escrowContract.contractId}
							</p>
							<p className="text-xs text-muted-foreground">
								State: {escrowContract.currentState}
							</p>
						</div>
					) : null}
				</div>
			</motion.div>
		</ManagePageShell>
	)
}
