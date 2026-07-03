'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { useProjectsFundingBalances } from '~/hooks/projects/use-projects-funding-balances'
import { calculateFundingProgressPercent } from '~/lib/utils/projects/project-funding'
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

	const { getDisplayRaised, isLoadingBalances } = useProjectsFundingBalances(projects)

	const projectsWithBalances = useMemo((): CreatorProjectWithBalance[] => {
		return projects.map((project) => {
			const raised = getDisplayRaised(project)
			const percentageComplete =
				calculateFundingProgressPercent(raised, project.goal) ?? project.percentageComplete

			return {
				...project,
				raised,
				percentageComplete,
			}
		})
	}, [projects, getDisplayRaised])

	const activeProjects = projectsWithBalances.filter(
		(p) => p.status === 'active' || p.status === 'review',
	)

	const totalRaised = projectsWithBalances.reduce((sum, project) => {
		if (project.raised === null) return sum
		return sum + Number(project.raised || 0)
	}, 0)

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
		isLoading: isLoading || isLoadingBalances,
		error,
	}
}
