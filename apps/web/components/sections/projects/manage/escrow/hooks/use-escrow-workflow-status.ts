import type {
	EscrowType,
	GetEscrowsFromIndexerResponse,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { useMemo } from 'react'
import {
	calculateMilestoneProgress,
	getMilestoneStatus,
	isSingleReleaseMilestone,
} from '~/lib/utils/escrow/milestone-utils'

export type EscrowManagementTab = 'overview' | 'fund' | 'milestones' | 'release'

export type EscrowWorkflowStep = {
	id: EscrowManagementTab
	label: string
	description: string
	status: 'complete' | 'current' | 'upcoming'
}

export function useEscrowWorkflowStatus({
	balance,
	milestones,
	escrowType,
	escrowData,
}: {
	balance: number | null
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[]
	escrowType: EscrowType
	escrowData?: GetEscrowsFromIndexerResponse | null
}) {
	return useMemo(() => {
		const hasBalance = balance !== null && balance > 0
		const approvedCount = milestones.filter((m) => getMilestoneStatus(m)).length
		const allApproved = milestones.length > 0 && approvedCount === milestones.length
		const isReleased =
			escrowData?.flags?.released ||
			(escrowType === 'multi-release' &&
				milestones.length > 0 &&
				milestones.every((m) => {
					if (isSingleReleaseMilestone(m)) return escrowData?.flags?.released
					return m.flags?.released
				}))

		const progress = calculateMilestoneProgress(milestones)

		let recommendedTab: EscrowManagementTab = 'overview'
		let headline = 'Review your escrow'
		let detail = 'Check contract details, roles, and milestone progress.'

		if (!hasBalance) {
			recommendedTab = 'fund'
			headline = 'Fund the escrow'
			detail = 'Add USDC to the contract before milestones can be approved and released.'
		} else if (milestones.length === 0) {
			recommendedTab = 'overview'
			headline = 'No milestones found'
			detail = 'This contract has no milestones indexed yet. Refresh or check the explorer.'
		} else if (approvedCount < milestones.length) {
			recommendedTab = 'milestones'
			headline = 'Approve milestones'
			detail = `${milestones.length - approvedCount} of ${milestones.length} milestone(s) still need approval.`
		} else if (!isReleased) {
			recommendedTab = 'release'
			headline = 'Release funds'
			detail =
				escrowType === 'single-release'
					? 'All milestones are approved. Release the escrow balance to the receiver.'
					: 'Approved milestones are ready. Release funds per milestone.'
		} else {
			recommendedTab = 'overview'
			headline = 'Escrow is complete'
			detail = 'Funds have been released. Review the final state in Overview.'
		}

		const steps: EscrowWorkflowStep[] = [
			{
				id: 'fund',
				label: 'Fund',
				description: 'Deposit USDC into the escrow contract.',
				status: hasBalance ? 'complete' : 'current',
			},
			{
				id: 'milestones',
				label: 'Milestones',
				description: 'Mark progress and approve deliverables.',
				status: !hasBalance
					? 'upcoming'
					: allApproved
						? 'complete'
						: approvedCount > 0
							? 'current'
							: 'current',
			},
			{
				id: 'release',
				label: 'Release',
				description: 'Send approved funds to receivers.',
				status: isReleased ? 'complete' : allApproved && hasBalance ? 'current' : 'upcoming',
			},
		]

		// Fix milestone step when funded but none approved yet
		if (hasBalance && approvedCount === 0) {
			steps[1].status = 'current'
		}

		return {
			recommendedTab,
			headline,
			detail,
			steps,
			hasBalance,
			allApproved,
			isReleased,
			progress,
			approvedCount,
			totalMilestones: milestones.length,
		}
	}, [balance, milestones, escrowType, escrowData])
}
