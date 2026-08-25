'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { syncEscrowAsAdminAction } from '~/app/actions/admin/sync-escrow-as-admin'
import { Button } from '~/components/base/button'
import { Skeleton } from '~/components/base/skeleton'
import { useEscrowData } from '~/hooks/escrow/use-escrow-data'
import type { AdminEscrowListItem } from '~/lib/queries/admin/get-admin-escrows'

interface EscrowDetailExpandProps {
	escrow: AdminEscrowListItem
	onSynced: () => void
}

/**
 * Lazily-loaded on-chain detail for one escrow. Indexer data is fetched
 * only when the row is expanded — never for the whole list at once.
 */
export function EscrowDetailExpand({ escrow, onSynced }: EscrowDetailExpandProps) {
	const { escrowData, isLoading, error, refetch } = useEscrowData({
		escrowContractAddress: escrow.contractId,
		escrowType: escrow.type ?? undefined,
	})
	const [hasFetched, setHasFetched] = useState(false)
	const [isSyncing, startSync] = useTransition()

	useEffect(() => {
		if (!hasFetched) {
			setHasFetched(true)
			void refetch()
		}
	}, [hasFetched, refetch])

	const indexerBalance = escrowData?.balance != null ? String(escrowData.balance) : null
	const milestones = escrowData?.milestones ?? []
	const approvedCount = milestones.filter(
		(milestone) =>
			('approved' in milestone && milestone.approved === true) ||
			('flags' in milestone &&
				(milestone as { flags?: { approved?: boolean } }).flags?.approved === true),
	).length
	const indexerMissing = !isLoading && !escrowData && error !== null
	const needsSync = escrow.health.issues.includes('missing_association')

	const handleSync = () => {
		if (!escrow.project) {
			toast.error('This escrow has no resolvable project to sync against.')
			return
		}
		const projectId = escrow.project.id
		startSync(async () => {
			const result = await syncEscrowAsAdminAction({
				projectId,
				contractId: escrow.contractId,
			})
			if (result.success) {
				toast.success(
					result.alreadySynced ? 'Escrow was already in sync.' : 'Escrow synced to the database.',
				)
				onSynced()
			} else {
				toast.error(result.error ?? 'Escrow sync failed.')
			}
		})
	}

	return (
		<div className="space-y-3 border-t bg-muted/30 p-4 text-sm">
			{isLoading ? (
				<output aria-label="Loading on-chain escrow detail" className="block space-y-2">
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-4 w-1/2" />
				</output>
			) : escrowData ? (
				<dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<dt className="text-xs text-muted-foreground">Indexer balance</dt>
						<dd className="font-medium tabular-nums">{indexerBalance ?? '—'}</dd>
					</div>
					<div>
						<dt className="text-xs text-muted-foreground">Releases approved</dt>
						<dd className="font-medium">
							{approvedCount} of {milestones.length}
						</dd>
					</div>
					<div>
						<dt className="text-xs text-muted-foreground">Disputed flag</dt>
						<dd className="font-medium">
							{(escrowData.flags as { disputed?: boolean } | undefined)?.disputed ? 'Yes' : 'No'}
						</dd>
					</div>
					<div>
						<dt className="text-xs text-muted-foreground">Released flag</dt>
						<dd className="font-medium">
							{(escrowData.flags as { released?: boolean } | undefined)?.released ? 'Yes' : 'No'}
						</dd>
					</div>
				</dl>
			) : (
				<div role="alert" className="flex flex-wrap items-center gap-3">
					<p className="text-muted-foreground">
						{indexerMissing
							? 'The Trustless Work indexer has no data for this contract — the database record may be ahead of the indexer, or the contract id is wrong.'
							: 'On-chain detail is unavailable.'}
					</p>
					<Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
						Retry
					</Button>
				</div>
			)}

			{needsSync || indexerMissing ? (
				<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 p-3">
					<p className="text-amber-800">
						{needsSync
							? 'This escrow is not linked to its project in the database.'
							: 'Database and indexer state may be out of sync.'}
					</p>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleSync}
						disabled={isSyncing || !escrow.project}
					>
						{isSyncing ? 'Syncing…' : 'Sync escrow'}
					</Button>
				</div>
			) : null}
		</div>
	)
}
