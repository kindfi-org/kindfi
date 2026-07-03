import type { EscrowType } from '@trustless-work/escrow'

/** Shared input for resolving how much a project has raised. */
export type ProjectFundingSource = {
	goal?: number | null
	/** Database fallback (`current_amount`). */
	raised?: number | null
	escrowContractAddress?: string | null
	escrowType?: EscrowType
}

export type ResolveDisplayRaisedParams = {
	dbRaised?: number | null
	escrowContractAddress?: string | null
	escrowBalance?: number | null
	isLoadingEscrowBalance?: boolean
}

const DEFAULT_ESCROW_TYPE: EscrowType = 'multi-release'

export const getProjectDbRaised = (project: ProjectFundingSource): number =>
	Number(project.raised ?? 0)

export const projectHasEscrow = (project: ProjectFundingSource): boolean =>
	Boolean(project.escrowContractAddress)

/**
 * Canonical raised amount: on-chain escrow balance when available, otherwise DB value.
 * Returns null while an escrow balance is loading (avoid showing stale DB data).
 */
export function resolveDisplayRaisedAmount({
	dbRaised,
	escrowContractAddress,
	escrowBalance,
	isLoadingEscrowBalance = false,
}: ResolveDisplayRaisedParams): number | null {
	const normalizedDbRaised = Number(dbRaised ?? 0)
	const hasEscrow = Boolean(escrowContractAddress)

	if (!hasEscrow) {
		return normalizedDbRaised
	}

	if (escrowBalance !== undefined && escrowBalance !== null) {
		return escrowBalance
	}

	if (isLoadingEscrowBalance) {
		return null
	}

	return normalizedDbRaised
}

export function calculateFundingProgressPercent(
	raised: number | null,
	goal?: number | null,
): number | null {
	const goalAmount = Number(goal ?? 0)
	if (!goalAmount || goalAmount <= 0 || raised === null) {
		return null
	}

	return Math.min(100, Math.round((raised / goalAmount) * 100))
}

export function formatProjectFundingAmount(
	amount: number | null,
	options?: {
		hasEscrow?: boolean
		loadingPlaceholder?: string
		maximumFractionDigits?: number
		minimumFractionDigits?: number
	},
): string {
	if (amount === null) {
		return options?.loadingPlaceholder ?? '…'
	}

	const hasEscrow = options?.hasEscrow ?? false
	const defaultFractionDigits = hasEscrow ? 2 : 0
	const maximumFractionDigits = options?.maximumFractionDigits ?? defaultFractionDigits
	const minimumFractionDigits = Math.min(
		options?.minimumFractionDigits ?? defaultFractionDigits,
		maximumFractionDigits,
	)

	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits,
		minimumFractionDigits,
	}).format(amount)
}

export function resolveEscrowBalanceFromMap(
	escrowContractAddress: string | undefined | null,
	escrowBalances: Record<string, number>,
): number | undefined {
	if (!escrowContractAddress || !Object.hasOwn(escrowBalances, escrowContractAddress)) {
		return undefined
	}

	return escrowBalances[escrowContractAddress]
}

export function resolveProjectDisplayFunding(
	project: ProjectFundingSource,
	options?: {
		escrowBalances?: Record<string, number>
		isLoadingEscrowBalance?: boolean
	},
): {
	raised: number | null
	progressPercent: number | null
	hasEscrow: boolean
} {
	const hasEscrow = projectHasEscrow(project)
	const escrowBalance = resolveEscrowBalanceFromMap(
		project.escrowContractAddress,
		options?.escrowBalances ?? {},
	)

	const raised = resolveDisplayRaisedAmount({
		dbRaised: getProjectDbRaised(project),
		escrowContractAddress: project.escrowContractAddress,
		escrowBalance,
		isLoadingEscrowBalance:
			options?.isLoadingEscrowBalance ??
			(hasEscrow && escrowBalance === undefined && Boolean(options?.escrowBalances)),
	})

	return {
		raised,
		progressPercent: calculateFundingProgressPercent(raised, project.goal),
		hasEscrow,
	}
}

export function getProjectEscrowType(project: ProjectFundingSource): EscrowType {
	return project.escrowType ?? DEFAULT_ESCROW_TYPE
}

export { DEFAULT_ESCROW_TYPE }
