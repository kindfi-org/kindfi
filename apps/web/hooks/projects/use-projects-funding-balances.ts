'use client'

import { useQuery } from '@tanstack/react-query'
import type {
	EscrowType,
	GetBalanceParams,
	GetEscrowBalancesResponse,
} from '@trustless-work/escrow'
import { useCallback, useMemo, useRef } from 'react'
import { useOptionalEscrow } from '~/hooks/contexts/use-escrow.context'
import { ESCROW_QUERY_POLL_MS, ESCROW_QUERY_STALE_MS } from '~/lib/constants/escrow-query.constants'
import {
	getProjectDbRaised,
	getProjectEscrowType,
	type ProjectFundingSource,
	resolveDisplayRaisedAmount,
	resolveEscrowBalanceFromMap,
} from '~/lib/utils/projects/project-funding'

const EMPTY_PROJECTS: ProjectFundingSource[] = []

export const projectsEscrowBalancesQueryKey = (escrowKey: string) =>
	['projects-escrow-balances', escrowKey] as const

export const buildProjectsEscrowKey = (projects: ProjectFundingSource[]): string =>
	projects
		.filter((project) => Boolean(project.escrowContractAddress))
		.map((project) => `${project.escrowContractAddress as string}|${getProjectEscrowType(project)}`)
		.sort()
		.join(',')

const fetchProjectsEscrowBalances = async (
	projects: ProjectFundingSource[],
	getBalances: (
		payload: GetBalanceParams,
		type: EscrowType,
	) => Promise<GetEscrowBalancesResponse[]>,
): Promise<Record<string, number>> => {
	const projectsWithEscrow = projects.filter((project) => Boolean(project.escrowContractAddress))

	if (projectsWithEscrow.length === 0) {
		return {}
	}

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
		const balances = await getBalances({ addresses }, type)
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

	return balanceMap
}

export function useProjectsFundingBalances(projects: ProjectFundingSource[] = EMPTY_PROJECTS) {
	const escrow = useOptionalEscrow()
	const getMultipleBalances = escrow?.getMultipleBalances
	const getMultipleBalancesRef = useRef(getMultipleBalances)
	getMultipleBalancesRef.current = getMultipleBalances

	const projectsRef = useRef(projects)
	projectsRef.current = projects

	const projectsEscrowKey = useMemo(() => buildProjectsEscrowKey(projects), [projects])

	const { data: escrowBalances = {}, isLoading: isLoadingBalances } = useQuery({
		queryKey: projectsEscrowBalancesQueryKey(projectsEscrowKey),
		queryFn: () =>
			fetchProjectsEscrowBalances(
				projectsRef.current,
				getMultipleBalancesRef.current as NonNullable<typeof getMultipleBalances>,
			),
		enabled: Boolean(projectsEscrowKey) && Boolean(getMultipleBalances),
		staleTime: ESCROW_QUERY_STALE_MS,
		refetchInterval: ESCROW_QUERY_POLL_MS,
		refetchOnWindowFocus: false,
		placeholderData: (previousData) => previousData,
	})

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
		isLoadingBalances: isLoadingBalances && Boolean(projectsEscrowKey),
		getDisplayRaised,
	}
}

/** @deprecated Use useProjectsFundingBalances */
export const useProfileEscrowBalances = useProjectsFundingBalances
