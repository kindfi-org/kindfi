'use client'

import type { EscrowType } from '@trustless-work/escrow'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { logger } from '@/lib/logger'
import { useOptionalEscrow } from '~/hooks/contexts/use-escrow.context'
import {
	getProjectDbRaised,
	getProjectEscrowType,
	type ProjectFundingSource,
	resolveDisplayRaisedAmount,
	resolveEscrowBalanceFromMap,
} from '~/lib/utils/projects/project-funding'

const EMPTY_PROJECTS: ProjectFundingSource[] = []

const buildProjectsEscrowKey = (projects: ProjectFundingSource[]): string =>
	projects
		.filter((project) => Boolean(project.escrowContractAddress))
		.map((project) => `${project.escrowContractAddress as string}|${getProjectEscrowType(project)}`)
		.sort()
		.join(',')

export function useProjectsFundingBalances(projects: ProjectFundingSource[] = EMPTY_PROJECTS) {
	const escrow = useOptionalEscrow()
	const getMultipleBalances = escrow?.getMultipleBalances
	const [escrowBalances, setEscrowBalances] = useState<Record<string, number>>({})
	const [isLoadingBalances, setIsLoadingBalances] = useState(false)
	const projectsRef = useRef(projects)
	projectsRef.current = projects

	const projectsEscrowKey = useMemo(() => buildProjectsEscrowKey(projects), [projects])

	const fetchBalances = useCallback(async () => {
		const projectsWithEscrow = projectsRef.current.filter((project) =>
			Boolean(project.escrowContractAddress),
		)

		if (projectsWithEscrow.length === 0 || !getMultipleBalances) {
			setEscrowBalances((prev) => (Object.keys(prev).length === 0 ? prev : {}))
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
	}, [getMultipleBalances, projectsEscrowKey])

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
