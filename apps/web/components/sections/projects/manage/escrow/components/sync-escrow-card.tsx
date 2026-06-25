'use client'

import { Link2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { syncEscrowToDatabaseAction } from '~/app/actions/escrow/sync-escrow-to-database'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { mapIndexerEscrowToSaveData } from '~/lib/utils/escrow/map-indexer-escrow-to-save-data'
import { parseIndexerEscrowResponse } from '~/lib/utils/escrow/parse-indexer-escrow-response'

interface SyncEscrowCardProps {
	projectId: string
	projectSlug: string
	initialContractId?: string
	variant?: 'default' | 'compact'
}

export function SyncEscrowCard({
	projectId,
	projectSlug,
	initialContractId = '',
	variant = 'default',
}: SyncEscrowCardProps) {
	const router = useRouter()
	const { getEscrowByContractIds } = useEscrow()
	const [contractId, setContractId] = useState(initialContractId)
	const [isSyncing, setIsSyncing] = useState(false)

	const handleSync = async () => {
		const trimmedContractId = contractId.trim()
		if (!trimmedContractId) {
			toast.error('Enter a contract ID')
			return
		}

		setIsSyncing(true)
		try {
			let escrowSnapshot: ReturnType<typeof mapIndexerEscrowToSaveData> | undefined

			try {
				const indexerResponse = await getEscrowByContractIds({
					contractIds: [trimmedContractId],
					validateOnChain: true,
				})
				const indexerEscrow = parseIndexerEscrowResponse(indexerResponse)
				if (indexerEscrow?.engagementId) {
					escrowSnapshot = mapIndexerEscrowToSaveData(indexerEscrow)
				}
			} catch {
				// Server-side indexer fetch is attempted when no client snapshot is available.
			}

			const result = await syncEscrowToDatabaseAction({
				projectId,
				contractId: trimmedContractId,
				escrowSnapshot,
			})

			if (!result.success) {
				toast.error('Failed to sync escrow to database', { description: result.error })
				return
			}

			toast.success(
				result.alreadySynced
					? 'Escrow is already linked to this project'
					: 'Escrow linked to project',
				{
					description: 'You can now fund and manage milestones from the escrow dashboard.',
				},
			)

			router.push(`/projects/${projectSlug}/manage`)
			router.refresh()
		} finally {
			setIsSyncing(false)
		}
	}

	if (variant === 'compact') {
		return (
			<div className="space-y-3 rounded-lg border border-dashed p-4">
				<div className="space-y-1">
					<p className="text-sm font-medium">Already deployed on-chain?</p>
					<p className="text-xs text-muted-foreground">
						Paste the contract ID to link an existing escrow to this project.
					</p>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row">
					<Input
						value={contractId}
						onChange={(event) => setContractId(event.target.value)}
						placeholder="C…"
						className="font-mono text-sm"
						disabled={isSyncing}
					/>
					<Button type="button" variant="secondary" onClick={handleSync} disabled={isSyncing}>
						{isSyncing ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
								Syncing…
							</>
						) : (
							<>
								<Link2 className="mr-2 h-4 w-4" aria-hidden="true" />
								Sync
							</>
						)}
					</Button>
				</div>
			</div>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Link Existing Escrow</CardTitle>
				<CardDescription>
					If the contract was deployed on Stellar but KindFi failed to save it, paste the contract
					ID below to fetch details from Trustless Work and link it to this project.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="sync-escrow-contract-id">Contract ID</Label>
					<Input
						id="sync-escrow-contract-id"
						value={contractId}
						onChange={(event) => setContractId(event.target.value)}
						placeholder="CCOWXKJYIKVVC7D7VDI6ZDGBQWNLQWPMNUXLQLVKQNPMX4G5ZGW7M6BX"
						className="font-mono text-sm"
						disabled={isSyncing}
					/>
				</div>
				<Button type="button" onClick={handleSync} disabled={isSyncing}>
					{isSyncing ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
							Syncing escrow…
						</>
					) : (
						<>
							<Link2 className="mr-2 h-4 w-4" aria-hidden="true" />
							Sync escrow to database
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	)
}
