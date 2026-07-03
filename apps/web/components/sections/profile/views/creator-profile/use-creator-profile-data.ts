'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import { logger } from '@/lib/logger'
import { useEscrow } from '~/hooks/contexts/use-escrow.context'
import type { CreatorProjectWithBalance } from './types'

async function fetchProfileProjects(): Promise<CreatorProjectWithBalance[]> {
	const response = await fetch('/api/profile/projects')
	if (!response.ok) {
		throw new Error('Failed to load projects')
	}
	return response.json()
}

export function useCreatorProfileData(userId: string) {
	const { status } = useSession()
	const {
		data: projects = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['profile', 'user-projects', userId],
		queryFn: fetchProfileProjects,
		enabled: status === 'authenticated' && Boolean(userId),
	})

	const { getMultipleBalances } = useEscrow()
	const [escrowBalances, setEscrowBalances] = useState<Record<string, number>>({})

	useEffect(() => {
		const fetchBalances = async () => {
			const projectsWithEscrow = projects.filter((p) => p.escrowContractAddress)
			if (projectsWithEscrow.length === 0) return

			try {
				const addresses = projectsWithEscrow.map((p) => p.escrowContractAddress as string)
				const balances = await getMultipleBalances({ addresses }, 'multi-release')
				const balanceMap: Record<string, number> = {}
				addresses.forEach((address, index) => {
					const balanceResponse = balances[index]
					if (balanceResponse?.balance !== undefined) {
						balanceMap[address] = balanceResponse.balance
					}
				})
				setEscrowBalances(balanceMap)
			} catch (error) {
				logger.error('Failed to fetch escrow balances', error)
			}
		}

		if (projects.length > 0) {
			fetchBalances()
			const intervalId = setInterval(fetchBalances, 10000)
			return () => clearInterval(intervalId)
		}
	}, [projects, getMultipleBalances])

	const projectsWithBalances = useMemo((): CreatorProjectWithBalance[] => {
		return projects.map((project) => {
			const escrowBalance =
				project.escrowContractAddress && escrowBalances[project.escrowContractAddress]
			const raised = Number(escrowBalance ?? project.raised ?? 0)
			const goal = Number(project.goal ?? 0)
			const percentageComplete = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0
			return { ...project, raised, percentageComplete }
		})
	}, [projects, escrowBalances])

	const activeProjects = projectsWithBalances.filter(
		(p) => p.status === 'active' || p.status === 'review',
	)
	const totalRaised = projectsWithBalances.reduce((sum, p) => sum + Number(p.raised || 0), 0)

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount)

	return {
		projects,
		projectsWithBalances,
		activeProjects,
		totalRaised,
		formatCurrency,
		isLoading,
		error,
	}
}
