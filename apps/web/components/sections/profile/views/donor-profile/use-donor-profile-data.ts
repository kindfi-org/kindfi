'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { useProjectsFundingBalances } from '~/hooks/projects/use-projects-funding-balances'
import { getUserSupportedProjects } from '~/lib/queries/projects/get-user-projects'
import { calculateFundingProgressPercent } from '~/lib/utils/projects/project-funding'
import type { DonorProjectWithBalance } from './types'

export function useDonorProfileData(userId: string) {
	const { status } = useSession()

	const {
		data: supportedProjects,
		isPending,
		error,
	} = useSupabaseQuery(
		'user-supported-projects',
		(client) => getUserSupportedProjects(client, userId),
		{
			additionalKeyValues: [userId],
			enabled: status === 'authenticated' && Boolean(userId),
			staleTime: 60_000,
		},
	)

	const { getDisplayRaised } = useProjectsFundingBalances(supportedProjects ?? [])

	const projectsWithBalances = useMemo((): DonorProjectWithBalance[] => {
		return (supportedProjects ?? []).map((project) => {
			const raised = getDisplayRaised(project)
			const percentageComplete =
				calculateFundingProgressPercent(raised, project.goal) ?? project.percentageComplete

			return { ...project, raised, percentageComplete }
		})
	}, [supportedProjects, getDisplayRaised])

	const stats = useMemo(() => {
		let totalContributed = 0

		for (const project of projectsWithBalances) {
			totalContributed += Number(project.contributionAmount || 0)
		}

		return {
			totalContributed,
			impactScore: projectsWithBalances.length * 10,
		}
	}, [projectsWithBalances])

	return {
		supportedProjects: supportedProjects ?? [],
		projectsWithBalances,
		stats,
		/** True only on the first fetch — keeps rendered projects mounted during refetches. */
		isLoading: isPending,
		error,
	}
}
