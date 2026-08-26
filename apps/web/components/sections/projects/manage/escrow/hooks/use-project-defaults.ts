import { useMemo } from 'react'
import { useManagedProjectQuery } from '~/hooks/projects/use-managed-project-query'
import { generateEngagementId, generateEscrowTitle } from '~/lib/utils/escrow'

interface ProjectDefaultsParams {
	projectId: string
	projectSlug: string
	projectTitle?: string
	projectDescription?: string
}

export function useProjectDefaults({
	projectId,
	projectSlug,
	projectTitle,
	projectDescription,
}: ProjectDefaultsParams) {
	const { data: escrowCount = 0 } = useManagedProjectQuery<number>(
		'escrow-count',
		projectSlug,
		'escrow-count',
		{ additionalKeyValues: [projectId] },
	)

	const consecutiveNumber = (escrowCount ?? 0) + 1

	const suggestedTitle = useMemo(() => {
		if (projectTitle) return generateEscrowTitle(projectTitle, consecutiveNumber)
		return `Kindfi - Project ${projectId} - ${consecutiveNumber}`
	}, [projectTitle, projectId, consecutiveNumber])

	const suggestedEngagementId = useMemo(() => {
		if (projectTitle) return generateEngagementId(projectTitle, consecutiveNumber)
		return `Kindfi - project-${projectId} - ${consecutiveNumber}`
	}, [projectTitle, projectId, consecutiveNumber])

	const suggestedDescription = useMemo(() => projectDescription ?? '', [projectDescription])

	return { suggestedTitle, suggestedEngagementId, suggestedDescription }
}
