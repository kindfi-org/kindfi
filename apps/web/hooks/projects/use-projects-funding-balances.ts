'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { logger } from '@/lib/logger'
import { useOptionalEscrow } from '~/hooks/contexts/use-escrow.context'
import {
	getProjectDbRaised,
	getProjectEscrowType,
	type ProjectFundingSource,
	resolveDisplayRaisedAmount,
	resolveEscrowBalanceFromMap,
} from '~/lib/utils/projects/project-funding'

export function useProjectsFundingBalances(projects: ProjectFundingSource[]) {
	const escrow = useOptionalEscrow()
	const getMultipleBalances = escrow?.getMultipleBalances
	const [escrowBalances, setEscrowBalances] = useState<Record<string, number>>({})
	const [isLoadingBalances, setIsLoadingBalances] = useState(false)

	const projectsWithEscrow = useMemo(
		() => projects.filter((project) => Boolean(project.escrowContractAddress)),
		[projects],
	)

	const fetchBalances = useCallback(async () => {
		if (projectsWithEscrow.length === 0 || !getMultipleBalances) {
			setEscrowBalances({})
			return
		}

		try {
			setIsLoadingBalances(true)

			const byType = new Map<EscrowType, string[]>()
			for (const project of projectsWithEscrow) {
				const address = project.escrowContractAddress as string
				const type = getProjectEscrowType(project)
				const addresses = byType.get(type) ?? []
				addresses.push(address)
				byType.set(type, addresses)
			}

			const balanceMap: Record<string, number> = {}

			for (const [type, addresses] of byType.entries()) {
				const balances = await getMultipleBalances({ addresses }, type)
				addresses.forEach((address, index) => {
					const balanceResponse = balances[index]
					if (balanceResponse?.balance !== undefined && balanceResponse.balance !== null) {
						const numericBalance = Number(balanceResponse.balance)
						if (Number.isFinite(numericBalance)) {
							balanceMap[address] = numericBalance
						}
					}
				})
			}

			setEscrowBalances(balanceMap)
		} catch (error) {
			logger.error('Failed to fetch project escrow balances', error)
		} finally {
			setIsLoadingBalances(false)
		}
	}, [getMultipleBalances, projectsWithEscrow])

	useEffect(() => {
		void fetchBalances()
		const intervalId = setInterval(() => {
			void fetchBalances()
		}, 10_000)

		return () => clearInterval(intervalId)
	}, [fetchBalances])

	const getDisplayRaised = useCallback(
		(project: ProjectFundingSource): number | null => {
			const address = project.escrowContractAddress
			const escrowBalance = resolveEscrowBalanceFromMap(address, escrowBalances)

			return resolveDisplayRaisedAmount({
				dbRaised: getProjectDbRaised(project),
				escrowContractAddress: address,
				escrowBalance,
				isLoadingEscrowBalance:
					Boolean(address) && isLoadingBalances && escrowBalance === undefined,
			})
		},
		[escrowBalances, isLoadingBalances],
	)

	return {
		escrowBalances,
		isLoadingBalances,
		getDisplayRaised,
	}
}

/** @deprecated Use useProjectsFundingBalances */
export const useProfileEscrowBalances = useProjectsFundingBalances
