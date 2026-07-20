import type { MultiReleaseMilestone, SingleReleaseMilestone } from '@trustless-work/escrow'
import { getEscrowByContractIdFromIndexer } from '~/lib/services/escrow-indexer.service'
import {
	getMilestoneReleasePhase,
	type MilestoneReleasePhase,
} from '~/lib/utils/escrow/milestone-utils'

export type MilestoneEligibilityResult =
	| { eligible: true; milestoneTitle: string; phase: MilestoneReleasePhase }
	| { eligible: false; reason: string }

export async function validateMilestoneReviewEligibility({
	escrowContractId,
	milestoneIndex,
}: {
	escrowContractId: string
	milestoneIndex: number
}): Promise<MilestoneEligibilityResult> {
	const result = await getEscrowByContractIdFromIndexer(escrowContractId, {
		validateOnChain: false,
	})

	if (!result.ok) {
		return { eligible: false, reason: result.error }
	}

	const milestones = result.escrow.milestones
	if (!milestones?.length) {
		return { eligible: false, reason: 'No milestones found for this escrow contract' }
	}

	if (milestoneIndex < 0 || milestoneIndex >= milestones.length) {
		return { eligible: false, reason: 'Invalid milestone index' }
	}

	const milestone = milestones[milestoneIndex] as SingleReleaseMilestone | MultiReleaseMilestone
	const phase = getMilestoneReleasePhase(milestone)

	if (phase === 'released' || phase === 'approved') {
		return {
			eligible: false,
			reason: 'This milestone has already been approved or released on-chain',
		}
	}

	const milestoneTitle = milestone.description?.trim() || `Release ${milestoneIndex + 1}`

	return { eligible: true, milestoneTitle, phase }
}
