import type { TypedSupabaseClient } from '@packages/lib/types'
import { getBasicProjectInfoBySlug } from './get-basic-project-info-by-slug'
import { getProjectMilestones } from './get-project-milestones'
import { getProjectPitch } from './get-project-pitch'
import { getProjectQuestions } from './get-project-questions'
import { getProjectTeam } from './get-project-team'
import { getProjectUpdates } from './get-project-updates'

export async function getProjectBySlug(
	client: TypedSupabaseClient,
	projectSlug: string,
) {
	const basicInfo = await getBasicProjectInfoBySlug(client, projectSlug)
	if (!basicInfo) return null

	const projectId = basicInfo.id

	const [pitch, team, milestones, updates, comments] = await Promise.all([
		getProjectPitch(client, projectId),
		getProjectTeam(client, projectId),
		getProjectMilestones(client, projectId),
		getProjectUpdates(client, projectId),
		getProjectQuestions(client, projectId),
	])

	return {
		...basicInfo,
		pitch,
		team,
		milestones,
		updates,
		comments,
	}
}
