import type {
	GetEscrowsFromIndexerResponse,
	MultiReleaseMilestone,
	SingleReleaseMilestone,
} from '@trustless-work/escrow'
import { isMilestoneReleased, isSingleReleaseMilestone } from '~/lib/utils/escrow/milestone-utils'
import { coerceNumericAmount } from '~/lib/utils/format-currency'
import { calculateFundingProgressPercent } from '~/lib/utils/projects/project-funding'

/**
 * Minimal structural shape for the release calculation. Satisfied by both the
 * app-level `Milestone` type and raw Supabase rows (whose `amount` may be a
 * numeric string).
 */
export type ReleasableMilestone = {
	amount: number | string | null | undefined
	status: string | null | undefined
}

/** Sum of amounts for milestones whose status is exactly 'released'. */
export function calculateReleasedAmount(
	milestones?: ReadonlyArray<ReleasableMilestone> | null,
): number {
	if (!Array.isArray(milestones)) {
		return 0
	}

	return milestones.reduce((total, milestone) => {
		if (milestone?.status !== 'released') {
			return total
		}
		return total + (coerceNumericAmount(milestone.amount) ?? 0)
	}, 0)
}

/** Released amount as a percent of goal (reuses the raised-bar percent logic). */
export function calculateReleasedProgressPercent(
	releasedAmount: number,
	goal?: number | null,
): number | null {
	return calculateFundingProgressPercent(releasedAmount, goal)
}

/** Sum of amounts for milestones released on-chain in a Trustless Work escrow. */
export function calculateReleasedAmountFromEscrow(
	escrow: GetEscrowsFromIndexerResponse | null | undefined,
): number {
	if (!escrow) {
		return 0
	}

	const escrowReleased = escrow.flags?.released ?? false

	if (escrow.type === 'single-release') {
		return escrowReleased ? (coerceNumericAmount(escrow.amount) ?? 0) : 0
	}

	const milestones =
		(escrow.milestones as (SingleReleaseMilestone | MultiReleaseMilestone)[] | undefined) ?? []

	return milestones.reduce((total, milestone) => {
		if (!isMilestoneReleased(milestone, escrowReleased)) {
			return total
		}

		if (isSingleReleaseMilestone(milestone)) {
			return total
		}

		return total + (coerceNumericAmount(milestone.amount) ?? 0)
	}, 0)
}

export type ResolveDisplayReleasedParams = {
	dbMilestones?: ReadonlyArray<ReleasableMilestone> | null
	/** Pre-aggregated DB fallback when milestone rows are not loaded. */
	dbReleasedAmount?: number | null
	escrowContractAddress?: string | null
	onChainReleasedAmount?: number | null
	isLoadingOnChain?: boolean
}

/**
 * Canonical released amount: on-chain escrow milestone totals when available,
 * otherwise DB milestone status sum. Returns null while on-chain data is loading.
 */
export function resolveDisplayReleasedAmount({
	dbMilestones,
	dbReleasedAmount,
	escrowContractAddress,
	onChainReleasedAmount,
	isLoadingOnChain = false,
}: ResolveDisplayReleasedParams): number | null {
	const hasEscrow = Boolean(escrowContractAddress)
	const dbReleased =
		dbReleasedAmount !== undefined && dbReleasedAmount !== null
			? (coerceNumericAmount(dbReleasedAmount) ?? 0)
			: calculateReleasedAmount(dbMilestones)

	if (!hasEscrow) {
		return dbReleased
	}

	if (onChainReleasedAmount !== undefined && onChainReleasedAmount !== null) {
		return onChainReleasedAmount
	}

	if (isLoadingOnChain) {
		return null
	}

	return dbReleased
}
