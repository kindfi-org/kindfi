import type { EscrowType } from '@trustless-work/escrow'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { logger } from '@/lib/logger'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import { useEscrowData } from '~/hooks/escrow/use-escrow-data'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { resolveEscrowType } from '~/lib/utils/escrow/resolve-escrow-type'

export function useProjectSidebarEscrowState(project: ProjectDetail) {
	const { getMultipleBalances, getEscrowByContractIds } = useEscrow()

	const [onChainRaised, setOnChainRaised] = useState<number | null>(null)
	const [isFetchingBalance, setIsFetchingBalance] = useState(false)

	const { escrowData, isLoading: isEscrowDataLoading } = useEscrowData({
		escrowContractAddress: project.escrowContractAddress || '',
		escrowType: project.escrowType,
	})

	const hasEscrow = Boolean(project.escrowContractAddress)

	const effectiveEscrowType = resolveEscrowType({
		indexerEscrow: escrowData,
		projectEscrowType: project.escrowType,
	})

	const isDonationReady = Boolean(hasEscrow && effectiveEscrowType && !isEscrowDataLoading)

	const effectiveRaised = onChainRaised ?? project.raised

	const progressPercentage = useMemo(() => {
		return Math.min(Math.round((effectiveRaised / project.goal) * 100), 100)
	}, [effectiveRaised, project.goal])

	const isGoalReached = useMemo(
		() => hasEscrow && project.goal > 0 && effectiveRaised >= project.goal,
		[hasEscrow, project.goal, effectiveRaised],
	)

	const resolveEscrowTypeForFunding = useCallback(async (): Promise<EscrowType> => {
		const knownType = resolveEscrowType({
			indexerEscrow: escrowData,
			projectEscrowType: project.escrowType,
		})
		if (knownType) return knownType

		if (!project.escrowContractAddress) {
			throw new Error('Escrow is not configured for this project')
		}

		const response = await getEscrowByContractIds({
			contractIds: [project.escrowContractAddress],
			validateOnChain: false,
		})
		const indexerEscrow = Array.isArray(response) ? response[0] : response
		if (indexerEscrow?.type) return indexerEscrow.type

		throw new Error('Unable to determine escrow configuration')
	}, [escrowData, getEscrowByContractIds, project.escrowContractAddress, project.escrowType])

	const fetchEscrowBalance = useCallback(async () => {
		if (!project.escrowContractAddress || !effectiveEscrowType) return
		try {
			setIsFetchingBalance(true)
			const balances = await getMultipleBalances(
				{ addresses: [project.escrowContractAddress] },
				effectiveEscrowType,
			)
			const first = balances?.[0]
			if (first) setOnChainRaised(first.balance)
		} catch (error) {
			logger.error('Failed to fetch escrow balance', error)
		} finally {
			setIsFetchingBalance(false)
		}
	}, [getMultipleBalances, project.escrowContractAddress, effectiveEscrowType])

	useEffect(() => {
		fetchEscrowBalance()
	}, [fetchEscrowBalance])

	return {
		escrowData,
		hasEscrow,
		effectiveEscrowType,
		isDonationReady,
		isEscrowDataLoading,
		onChainRaised,
		isFetchingBalance,
		effectiveRaised,
		progressPercentage,
		isGoalReached,
		fetchEscrowBalance,
		resolveEscrowTypeForFunding,
	}
}
