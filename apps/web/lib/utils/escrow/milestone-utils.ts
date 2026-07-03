import type { MultiReleaseMilestone, SingleReleaseMilestone } from '@trustless-work/escrow'

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

export function formatMilestoneWorkStatus(status: string): string {
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
): number {
	if (!milestones.length) return 0
	const completed = milestones.filter((m) => getMilestoneStatus(m)).length
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
