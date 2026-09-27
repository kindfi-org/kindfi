'use client'

import type {
	EscrowType,
	GetEscrowsFromIndexerResponse,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { FileText, Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '~/components/base/alert'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { TooltipProvider } from '~/components/base/tooltip'
import { MAX_ESCROW_RELEASES } from '~/lib/utils/escrow/build-update-escrow-payload'
import {
	getMilestoneReleasePhase,
	getMilestoneStatus,
	getMilestoneWorkStatus,
	normalizeWorkStatusForForm,
	truncateAddress,
} from '~/lib/utils/escrow/milestone-utils'
import { AddReleaseDialog } from '../components/add-release-dialog'
import { MilestoneEditForm } from '../components/milestone-edit-form'
import { MilestoneListItem } from '../components/milestone-list-item'
import { useMilestonePatch } from '../hooks/use-milestone-patch'

interface MilestonesTabProps {
	escrowContractAddress: string
	escrowType: EscrowType
	escrowData: GetEscrowsFromIndexerResponse | null
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[]
	isLoading: boolean
	onSuccess: () => void
	onPatchMilestone?: (
		index: number,
		patch: { kind: 'approve' } | { kind: 'status'; status: string; evidence?: string },
	) => void
	onGoToRelease?: () => void
}

export function MilestonesTab({
	escrowContractAddress,
	escrowType,
	escrowData,
	milestones,
	isLoading,
	onSuccess,
	onPatchMilestone,
	onGoToRelease,
}: MilestonesTabProps) {
	const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState('0')
	const [milestoneStatus, setMilestoneStatus] = useState('in_progress')
	const [milestoneEvidence, setMilestoneEvidence] = useState('')
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [editingMilestoneIndex, setEditingMilestoneIndex] = useState<number | null>(null)

	const {
		processingOperation,
		isProcessing,
		handleApproveMilestone,
		handleChangeMilestoneStatus,
		handleAddRelease,
		handleEditRelease,
		getReleaseFormValues,
	} = useMilestonePatch({
		escrowContractAddress,
		escrowType,
		onSuccess,
		onPatchMilestone,
	})

	const selectedIndex = Number(selectedMilestoneIndex)
	const selectedMilestone = milestones[selectedIndex]
	const selectedPhase = selectedMilestone ? getMilestoneReleasePhase(selectedMilestone) : null
	const canAddRelease = milestones.length < MAX_ESCROW_RELEASES && !escrowData?.flags?.disputed
	const editingMilestone = editingMilestoneIndex !== null ? milestones[editingMilestoneIndex] : null

	useEffect(() => {
		const milestone = milestones[selectedIndex]
		if (!milestone) return

		setMilestoneStatus(normalizeWorkStatusForForm(getMilestoneWorkStatus(milestone)))
		setMilestoneEvidence(milestone.evidence ?? '')
	}, [milestones, selectedIndex])

	if (isLoading) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center gap-4 py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden="true" />
					<p className="text-sm text-muted-foreground" aria-live="polite">
						Loading releases…
					</p>
				</CardContent>
			</Card>
		)
	}

	if (milestones.length === 0) {
		return (
			<div className="space-y-4">
				<Card>
					<CardContent className="flex flex-col items-center justify-center gap-4 py-12">
						<FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
						<p className="text-sm text-muted-foreground">
							No releases found yet. Add one to get started.
						</p>
						{escrowData ? (
							<Button
								type="button"
								onClick={() => setIsAddDialogOpen(true)}
								disabled={isProcessing || !canAddRelease}
							>
								<Plus className="mr-2 h-4 w-4" aria-hidden="true" />
								Add release
							</Button>
						) : null}
					</CardContent>
				</Card>
				<AddReleaseDialog
					open={isAddDialogOpen}
					onOpenChange={setIsAddDialogOpen}
					escrowType={escrowType}
					isSubmitting={isProcessing}
					onSubmit={(release) =>
						handleAddRelease({ release, onComplete: () => setIsAddDialogOpen(false) })
					}
				/>
			</div>
		)
	}

	const isSelectedApproved = selectedMilestone ? getMilestoneStatus(selectedMilestone) : false
	const platformAddress = escrowData?.roles.platformAddress

	return (
		<div className="space-y-6">
			{platformAddress ? (
				<Alert>
					<AlertDescription>
						Adding or editing releases requires the escrow platform wallet{' '}
						<span className="font-mono">{truncateAddress(platformAddress)}</span> connected in
						Freighter or another external Stellar wallet on the same network as this escrow.
					</AlertDescription>
				</Alert>
			) : null}
			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<CardTitle>Select a Release</CardTitle>
							<CardDescription>
								Choose a release to update its status or approve it. Approver and Service Provider
								roles sign with their connected wallet.
							</CardDescription>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setIsAddDialogOpen(true)}
							disabled={isProcessing || !canAddRelease || !escrowData}
							className="shrink-0"
						>
							<Plus className="mr-2 h-4 w-4" aria-hidden="true" />
							Add release
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					<TooltipProvider delayDuration={200}>
						{milestones.map((milestone, index) => (
							<MilestoneListItem
								key={index}
								milestone={milestone}
								index={index}
								isSelected={selectedMilestoneIndex === String(index)}
								isProcessing={isProcessing}
								hasEscrowData={!!escrowData}
								onSelect={(i) => setSelectedMilestoneIndex(String(i))}
								onEdit={(i) => setEditingMilestoneIndex(i)}
							/>
						))}
					</TooltipProvider>
				</CardContent>
			</Card>

			{!canAddRelease && milestones.length >= MAX_ESCROW_RELEASES ? (
				<Alert>
					<AlertDescription>
						This escrow has reached the maximum of {MAX_ESCROW_RELEASES} releases.
					</AlertDescription>
				</Alert>
			) : null}

			<MilestoneEditForm
				selectedIndex={selectedIndex}
				isSelectedApproved={!!isSelectedApproved}
				selectedPhase={selectedPhase}
				escrowType={escrowType}
				milestoneStatus={milestoneStatus}
				milestoneEvidence={milestoneEvidence}
				processingOperation={processingOperation}
				onMilestoneStatusChange={setMilestoneStatus}
				onMilestoneEvidenceChange={setMilestoneEvidence}
				onChangeMilestoneStatus={() =>
					handleChangeMilestoneStatus({
						milestoneIndex: selectedMilestoneIndex,
						status: milestoneStatus,
						evidence: milestoneEvidence,
						onComplete: () => setMilestoneEvidence(''),
					})
				}
				onApproveMilestone={() =>
					handleApproveMilestone({ milestoneIndex: selectedMilestoneIndex })
				}
				onGoToRelease={onGoToRelease}
			/>

			<AddReleaseDialog
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				escrowType={escrowType}
				isSubmitting={isProcessing}
				onSubmit={(release) =>
					handleAddRelease({ release, onComplete: () => setIsAddDialogOpen(false) })
				}
			/>

			{editingMilestone ? (
				<AddReleaseDialog
					open={editingMilestoneIndex !== null}
					onOpenChange={(open) => {
						if (!open) {
							setEditingMilestoneIndex(null)
						}
					}}
					escrowType={escrowType}
					isSubmitting={isProcessing}
					mode="edit"
					releaseLabel={`Release ${(editingMilestoneIndex ?? 0) + 1}`}
					initialValues={getReleaseFormValues(editingMilestone)}
					onSubmit={(release) =>
						handleEditRelease({
							milestoneIndex: editingMilestoneIndex,
							release,
							onComplete: () => setEditingMilestoneIndex(null),
						})
					}
				/>
			) : null}
		</div>
	)
}
