import type { MultiReleaseMilestone, SingleReleaseMilestone } from '@trustless-work/escrow'

export type MilestoneReleasePhase =
	| 'released'
	| 'approved'
	| 'ready_for_approval'
	| 'in_progress'
	| 'not_started'
	| 'unknown'

const WORK_STATUS_FORM_VALUES = ['pending', 'in_progress', 'completed'] as const
export type MilestoneWorkStatusFormValue = (typeof WORK_STATUS_FORM_VALUES)[number]

/**
 * Type guard to check if a milestone is a SingleReleaseMilestone
 */
export function isSingleReleaseMilestone(
	milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): milestone is SingleReleaseMilestone {
	return 'approved' in milestone
}

/**
 * Whether the approver has signed off (required before release).
 * This is separate from milestone.status, which tracks service-provider work progress.
 */
export function getMilestoneStatus(
	milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): boolean {
	return isSingleReleaseMilestone(milestone)
		? (milestone.approved ?? false)
		: (milestone.flags?.approved ?? false)
}

export function getMilestoneWorkStatus(
	milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): string | undefined {
	return milestone.status?.trim() || undefined
}

/** Legacy UI/API used "approved" as work status; TW convention is "completed". */
export function normalizeWorkStatus(status: string | undefined): string | undefined {
	if (!status) return undefined
	if (status.toLowerCase() === 'approved') return 'completed'
	return status
}

export function isWorkComplete(status: string | undefined): boolean {
	const normalized = normalizeWorkStatus(status)?.toLowerCase()
	return normalized === 'completed'
}

export function normalizeWorkStatusForForm(
	status: string | undefined,
): MilestoneWorkStatusFormValue {
	const normalized = normalizeWorkStatus(status)?.toLowerCase()
	if (normalized === 'pending') return 'pending'
	if (normalized === 'completed') return 'completed'
	return 'in_progress'
}

export function formatMilestoneWorkStatus(status: string): string {
	const normalized = normalizeWorkStatus(status) ?? status
	return normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getMilestoneReleasePhase(
	milestone: SingleReleaseMilestone | MultiReleaseMilestone,
	options?: { escrowReleased?: boolean },
): MilestoneReleasePhase {
	if (isMilestoneReleased(milestone, options?.escrowReleased)) {
		return 'released'
	}

	if (getMilestoneStatus(milestone)) {
		return 'approved'
	}

	if (isWorkComplete(getMilestoneWorkStatus(milestone))) {
		return 'ready_for_approval'
	}

	const work = getMilestoneWorkStatus(milestone)?.toLowerCase()
	if (work === 'in_progress') return 'in_progress'
	if (work === 'pending' || !work) return 'not_started'

	return 'unknown'
}

export function formatMilestoneReleasePhase(phase: MilestoneReleasePhase): string {
	switch (phase) {
		case 'released':
			return 'Released'
		case 'approved':
			return 'Approved'
		case 'ready_for_approval':
			return 'Ready for approval'
		case 'in_progress':
			return 'Work in progress'
		case 'not_started':
			return 'Not started'
		default:
			return 'In progress'
	}
}

export function getMilestoneReleasePhaseBadgeVariant(
	phase: MilestoneReleasePhase,
): 'default' | 'secondary' | 'outline' | 'destructive' {
	switch (phase) {
		case 'released':
		case 'approved':
			return 'default'
		case 'ready_for_approval':
			return 'secondary'
		case 'in_progress':
		case 'unknown':
			return 'outline'
		case 'not_started':
			return 'secondary'
	}
}

export function isMilestoneReleased(
	milestone: SingleReleaseMilestone | MultiReleaseMilestone,
	escrowReleased = false,
): boolean {
	if (!isSingleReleaseMilestone(milestone)) {
		return milestone.flags?.released ?? false
	}

	return escrowReleased
}

/** Maps on-chain escrow milestone state to the public project page status. */
export function mapEscrowMilestoneToPublicStatus(
	milestone: SingleReleaseMilestone | MultiReleaseMilestone,
	options?: { escrowReleased?: boolean },
): 'pending' | 'completed' | 'approved' | 'released' | 'rejected' | 'disputed' {
	if (isMilestoneReleased(milestone, options?.escrowReleased)) {
		return 'released'
	}

	if (!isSingleReleaseMilestone(milestone) && milestone.flags?.disputed) {
		return 'disputed'
	}

	if (getMilestoneStatus(milestone)) {
		return 'approved'
	}

	if (isWorkComplete(getMilestoneWorkStatus(milestone))) {
		return 'completed'
	}

	const work = getMilestoneWorkStatus(milestone)?.toLowerCase()
	if (work === 'rejected') return 'rejected'
	if (work === 'disputed') return 'disputed'

	return 'pending'
}

export function formatPublicMilestoneStatus(status: string): string {
	return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

/** Apply a local milestone patch after a successful on-chain mutation. */
export function patchMilestoneAtIndex(
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[],
	index: number,
	patch: { kind: 'approve' } | { kind: 'status'; status: string; evidence?: string },
): (SingleReleaseMilestone | MultiReleaseMilestone)[] {
	return milestones.map((milestone, milestoneIndex) => {
		if (milestoneIndex !== index) {
			return milestone
		}

		if (patch.kind === 'approve') {
			if (isSingleReleaseMilestone(milestone)) {
				return { ...milestone, approved: true }
			}

			return {
				...milestone,
				flags: {
					...(milestone.flags ?? {}),
					approved: true,
				},
			}
		}

		return {
			...milestone,
			status: patch.status,
			...(patch.evidence !== undefined ? { evidence: patch.evidence } : {}),
		}
	})
}

/**
 * Calculate progress percentage based on approved milestones
 */
export function calculateMilestoneProgress(
	milestones: (SingleReleaseMilestone | MultiReleaseMilestone)[],
	options?: { escrowReleased?: boolean },
): number {
	if (!milestones.length) return 0
	const completed = milestones.filter(
		(m) => getMilestoneStatus(m) || isMilestoneReleased(m, options?.escrowReleased),
	).length
	return Math.round((completed / milestones.length) * 100)
}

/**
 * Format amount with proper decimals
 */
export function formatEscrowAmount(amount: number | undefined | null): string {
	if (amount === undefined || amount === null) return 'N/A'
	return `$${amount.toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 7,
	})}`
}

/**
 * Truncate Stellar address for display
 */
export function truncateAddress(address: string, length = 8): string {
	if (!address) return 'N/A'
	if (address.length <= length * 2) return address
	return `${address.substring(0, length)}...${address.substring(address.length - length)}`
}
