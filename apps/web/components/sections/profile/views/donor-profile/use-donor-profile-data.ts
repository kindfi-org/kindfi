'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'
import { useProjectsFundingBalances } from '~/hooks/projects/use-projects-funding-balances'
import { useAuth } from '~/hooks/use-auth'
import { getUserSupportedProjects } from '~/lib/queries/projects/get-user-projects'
import { calculateFundingProgressPercent } from '~/lib/utils/projects/project-funding'
import type { DonorProjectWithBalance } from './types'

export function useDonorProfileData(userId: string) {
	const { status } = useSession()
	const { isSupabaseUserLoading } = useAuth()
	const queryEnabled = status === 'authenticated' && Boolean(userId) && !isSupabaseUserLoading

	const {
		data: supportedProjects,
		isLoading,
		error,
	} = useSupabaseQuery(
		'user-supported-projects',
		(client) => getUserSupportedProjects(client, userId),
		{ additionalKeyValues: [userId], enabled: queryEnabled },
	)

	const { getDisplayRaised, isLoadingBalances } = useProjectsFundingBalances(supportedProjects)

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
		isLoading: isLoading || isLoadingBalances,
		error,
	}
}
