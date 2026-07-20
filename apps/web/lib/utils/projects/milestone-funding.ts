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
