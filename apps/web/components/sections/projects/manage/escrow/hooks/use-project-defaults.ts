import { useSupabaseQuery } from '@packages/lib/hooks'
import { useMemo } from 'react'
import { getEscrowCountByProject } from '~/lib/queries/escrow/get-escrow-count-by-project'
import { generateEngagementId, generateEscrowTitle } from '~/lib/utils/escrow'

interface ProjectDefaultsParams {
	projectId: string
	projectTitle?: string
	projectDescription?: string
}

export function useProjectDefaults({
	projectId,
	projectTitle,
	projectDescription,
}: ProjectDefaultsParams) {
	const { data: escrowCount = 0 } = useSupabaseQuery(
		'escrow-count',
		(client) => getEscrowCountByProject(client, projectId),
		{ additionalKeyValues: [projectId] },
	)

	const consecutiveNumber = (escrowCount ?? 0) + 1

	const suggestedTitle = useMemo(() => {
		if (projectTitle) return generateEscrowTitle(projectTitle, consecutiveNumber)
		return `Kindfi - Project ${projectId} - ${consecutiveNumber}`
	}, [projectTitle, projectId, consecutiveNumber])

	const suggestedEngagementId = useMemo(() => {
		if (projectTitle)
			return generateEngagementId(projectTitle, consecutiveNumber)
		return `Kindfi - project-${projectId} - ${consecutiveNumber}`
	}, [projectTitle, projectId, consecutiveNumber])

	const suggestedDescription = useMemo(
		() => projectDescription ?? '',
		[projectDescription],
	)

	return { suggestedTitle, suggestedEngagementId, suggestedDescription }
}
