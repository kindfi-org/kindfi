'use client'

import type {
	EscrowType,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { ApproveMilestoneCard } from './milestones-tab/approve-milestone-card'
import {
	MilestonesEmptyState,
	MilestonesLoadingState,
} from './milestones-tab/milestones-empty-states'
import { MilestonesList } from './milestones-tab/milestones-list'
import { UpdateStatusCard } from './milestones-tab/update-status-card'
import { useMilestoneActions } from './milestones-tab/use-milestone-actions'

interface MilestonesTabProps {
	escrowContractAddress: string
	escrowType: EscrowType
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[]
	isLoading: boolean
	onSuccess: () => void
}

export function MilestonesTab({
	escrowContractAddress,
	escrowType,
	milestones,
	isLoading,
	onSuccess,
}: MilestonesTabProps) {
	const {
		selectedMilestoneIndex,
		setSelectedMilestoneIndex,
		milestoneStatus,
		setMilestoneStatus,
		milestoneEvidence,
		setMilestoneEvidence,
		isProcessing,
		handleApproveMilestone,
		handleChangeMilestoneStatus,
	} = useMilestoneActions({
		escrowContractAddress,
		escrowType,
		onSuccess,
	})

	if (isLoading) {
		return <MilestonesLoadingState />
	}

	if (milestones.length === 0) {
		return <MilestonesEmptyState />
	}

	return (
		<>
			<MilestonesList milestones={milestones} />

			<div className="grid gap-6 md:grid-cols-2">
				<ApproveMilestoneCard
					milestones={milestones}
					selectedMilestoneIndex={selectedMilestoneIndex}
					onMilestoneChange={setSelectedMilestoneIndex}
					isProcessing={isProcessing}
					onApprove={handleApproveMilestone}
				/>

				<UpdateStatusCard
					milestones={milestones}
					selectedMilestoneIndex={selectedMilestoneIndex}
					onMilestoneChange={setSelectedMilestoneIndex}
					milestoneStatus={milestoneStatus}
					onStatusChange={setMilestoneStatus}
					milestoneEvidence={milestoneEvidence}
					onEvidenceChange={setMilestoneEvidence}
					isProcessing={isProcessing}
					onUpdateStatus={handleChangeMilestoneStatus}
				/>
			</div>
		</>
	)
}
