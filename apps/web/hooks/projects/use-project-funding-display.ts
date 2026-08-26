'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { useMemo } from 'react'
import { useEscrowBalance } from '~/hooks/escrow/use-escrow-balance'
import { useProjectSupportersCount } from '~/hooks/projects/use-project-supporters-count'
import {
	calculateFundingProgressPercent,
	formatProjectFundingAmount,
	getProjectDbRaised,
	type ProjectFundingSource,
	projectHasEscrow,
	resolveDisplayRaisedAmount,
} from '~/lib/utils/projects/project-funding'

interface UseProjectFundingDisplayParams extends ProjectFundingSource {
	projectId?: string
	escrowType?: EscrowType
	dbInvestors?: number
}

export function useProjectFundingDisplay({
	projectId,
	escrowContractAddress,
	escrowType,
	goal = 0,
	raised,
	dbInvestors = 0,
}: UseProjectFundingDisplayParams) {
	const hasEscrow = projectHasEscrow({ escrowContractAddress })
	const dbRaised = getProjectDbRaised({ raised })

	const { balance: onChainBalance, isLoading: isLoadingBalance } = useEscrowBalance({
		escrowContractAddress: escrowContractAddress ?? undefined,
		escrowType,
	})

	const { supportersCount, isLoading: isLoadingSupporters } = useProjectSupportersCount({
		projectId,
	})

	const displayRaised = useMemo(
		() =>
			resolveDisplayRaisedAmount({
				dbRaised,
				escrowContractAddress,
				escrowBalance: onChainBalance,
				isLoadingEscrowBalance: hasEscrow && isLoadingBalance && onChainBalance === null,
			}),
		[dbRaised, escrowContractAddress, hasEscrow, isLoadingBalance, onChainBalance],
	)

	const displaySupporters = useMemo(
		() => supportersCount ?? dbInvestors,
		[supportersCount, dbInvestors],
	)

	const progressPercent = useMemo(
		() => calculateFundingProgressPercent(displayRaised, goal),
		[displayRaised, goal],
	)

	const raisedLabel = hasEscrow ? 'Escrow balance' : 'Raised'

	const isLoadingStats = displayRaised === null || (isLoadingSupporters && supportersCount === null)

	const formatCurrency = (
		amount: number,
		options?: { maximumFractionDigits?: number; minimumFractionDigits?: number },
	) =>
		formatProjectFundingAmount(amount, {
			hasEscrow,
			maximumFractionDigits: options?.maximumFractionDigits,
			minimumFractionDigits: options?.minimumFractionDigits,
		})

	return {
		displayRaised,
		displaySupporters,
		progressPercent,
		raisedLabel,
		hasEscrow,
		isLoadingStats,
		formatCurrency,
	}
}
