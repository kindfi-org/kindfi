import type {
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'

/**
 * Type guard to check if a milestone is a SingleReleaseMilestone
 */
export function isSingleReleaseMilestone(
	milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): milestone is SingleReleaseMilestone {
	return 'approved' in milestone
}

/**
 * Get the approval status of a milestone
 */
export function getMilestoneStatus(
	milestone: SingleReleaseMilestone | MultiReleaseMilestone,
): boolean {
	return isSingleReleaseMilestone(milestone)
		? (milestone.approved ?? false)
		: (milestone.flags?.approved ?? false)
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
