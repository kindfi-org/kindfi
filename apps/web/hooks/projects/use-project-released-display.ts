'use client'

import type { EscrowType, GetEscrowsFromIndexerResponse } from '@trustless-work/escrow'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOptionalEscrow } from '~/hooks/contexts/use-escrow.context'
import {
	calculateReleasedAmountFromEscrow,
	calculateReleasedProgressPercent,
	type ReleasableMilestone,
	resolveDisplayReleasedAmount,
} from '~/lib/utils/projects/milestone-funding'
import { projectHasEscrow } from '~/lib/utils/projects/project-funding'

interface UseProjectReleasedDisplayParams {
	escrowContractAddress?: string | null
	escrowType?: EscrowType
	goal?: number | null
	dbMilestones?: ReadonlyArray<ReleasableMilestone> | null
	dbReleasedAmount?: number | null
	preloadedEscrowData?: GetEscrowsFromIndexerResponse | null
}

export function useProjectReleasedDisplay({
	escrowContractAddress,
	goal,
	dbMilestones,
	dbReleasedAmount,
	preloadedEscrowData,
}: UseProjectReleasedDisplayParams) {
	const escrow = useOptionalEscrow()
	const getEscrowByContractIds = escrow?.getEscrowByContractIds

	const hasEscrow = projectHasEscrow({ escrowContractAddress })
	const [onChainReleasedAmount, setOnChainReleasedAmount] = useState<number | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const effectiveOnChainAmount = useMemo(() => {
		if (preloadedEscrowData) {
			return calculateReleasedAmountFromEscrow(preloadedEscrowData)
		}
		return onChainReleasedAmount
	}, [preloadedEscrowData, onChainReleasedAmount])

	const fetchReleasedAmount = useCallback(
		async (showLoading = true) => {
			if (!escrowContractAddress || !getEscrowByContractIds || preloadedEscrowData) {
				return
			}

			try {
				if (showLoading) setIsLoading(true)
				const response = await getEscrowByContractIds({
					contractIds: [escrowContractAddress],
					validateOnChain: true,
				})
				const escrowData = Array.isArray(response) ? response[0] : response
				setOnChainReleasedAmount(calculateReleasedAmountFromEscrow(escrowData))
			} catch {
				setOnChainReleasedAmount(null)
			} finally {
				if (showLoading) setIsLoading(false)
			}
		},
		[escrowContractAddress, getEscrowByContractIds, preloadedEscrowData],
	)

	useEffect(() => {
		if (!hasEscrow || preloadedEscrowData) {
			setOnChainReleasedAmount(null)
			setIsLoading(false)
			return
		}

		if (!getEscrowByContractIds) {
			return
		}

		fetchReleasedAmount(true)

		const intervalId = setInterval(() => {
			fetchReleasedAmount(false)
		}, 10000)

		return () => {
			clearInterval(intervalId)
		}
	}, [fetchReleasedAmount, getEscrowByContractIds, hasEscrow, preloadedEscrowData])

	const displayReleased = useMemo(
		() =>
			resolveDisplayReleasedAmount({
				dbMilestones,
				dbReleasedAmount,
				escrowContractAddress,
				onChainReleasedAmount: hasEscrow ? effectiveOnChainAmount : null,
				isLoadingOnChain: hasEscrow && isLoading && effectiveOnChainAmount === null,
			}),
		[
			dbMilestones,
			dbReleasedAmount,
			escrowContractAddress,
			effectiveOnChainAmount,
			hasEscrow,
			isLoading,
		],
	)

	const releasedProgressPercent = useMemo(
		() =>
			displayReleased === null ? null : calculateReleasedProgressPercent(displayReleased, goal),
		[displayReleased, goal],
	)

	return {
		displayReleased,
		releasedProgressPercent,
		isLoadingReleased: displayReleased === null && hasEscrow,
	}
}
