'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { useMemo } from 'react'
import { useEscrowBalance } from '~/hooks/escrow/use-escrow-balance'
import { useProjectSupportersCount } from '~/hooks/projects/use-project-supporters-count'

interface UseProjectFundingDisplayParams {
	projectId?: string
	escrowContractAddress?: string
	escrowType?: EscrowType
	goal?: number
	dbRaised?: number
	dbInvestors?: number
}

export function useProjectFundingDisplay({
	projectId,
	escrowContractAddress,
	escrowType,
	goal = 0,
	dbRaised = 0,
	dbInvestors = 0,
}: UseProjectFundingDisplayParams) {
	const hasEscrow = Boolean(escrowContractAddress)

	const { balance: onChainBalance, isLoading: isLoadingBalance } = useEscrowBalance({
		escrowContractAddress,
		escrowType,
	})

	const { supportersCount, isLoading: isLoadingSupporters } = useProjectSupportersCount({
		projectId,
	})

	const displayRaised = useMemo(() => {
		if (hasEscrow) {
			if (onChainBalance !== null) return onChainBalance
			if (!isLoadingBalance) return 0
			return null
		}
		return dbRaised
	}, [hasEscrow, onChainBalance, isLoadingBalance, dbRaised])

	const displaySupporters = useMemo(
		() => supportersCount ?? dbInvestors,
		[supportersCount, dbInvestors],
	)

	const progressPercent = useMemo(() => {
		if (!goal || goal <= 0 || displayRaised === null) return null
		return Math.min(100, Math.round((displayRaised / goal) * 100))
	}, [displayRaised, goal])

	const raisedLabel = hasEscrow ? 'Escrow balance' : 'Raised'

	const isLoadingStats = displayRaised === null || (isLoadingSupporters && supportersCount === null)

	const formatCurrency = (
		amount: number,
		options?: { maximumFractionDigits?: number; minimumFractionDigits?: number },
	) =>
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: options?.maximumFractionDigits ?? (hasEscrow ? 2 : 0),
			minimumFractionDigits: options?.minimumFractionDigits ?? (hasEscrow ? 2 : 0),
		}).format(amount)

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
