import type { TypedSupabaseClient } from '@packages/lib/types'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import type { LocalizeOptions } from '~/lib/services/content-translation'
import { getBasicProjectInfoBySlug } from './get-basic-project-info-by-slug'
import { getProjectMilestones } from './get-project-milestones'
import { getProjectPitch } from './get-project-pitch'
import { getProjectQuestions } from './get-project-questions'
import { getProjectTeam } from './get-project-team'
import { getProjectUpdates } from './get-project-updates'

export type GetProjectBySlugOptions = LocalizeOptions & {
	viewerLocale?: SupportedLocale
}

export async function getProjectBySlug(
	client: TypedSupabaseClient,
	projectSlug: string,
	options?: GetProjectBySlugOptions,
) {
	const basicInfo = await getBasicProjectInfoBySlug(client, projectSlug, options)
	if (!basicInfo) return null

	const projectId = basicInfo.id

	const [pitch, team, milestones, updates, comments] = await Promise.all([
		getProjectPitch(client, projectId, options),
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
