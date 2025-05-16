import type { TypedSupabaseClient } from '@packages/lib/types'
import { getProjectMilestones } from './get-project-milestones'
import { getProjectPitch } from './get-project-pitch'
import { getProjectQuestions } from './get-project-questions'
import { getProjectTeam } from './get-project-team'
import { getProjectUpdates } from './get-project-updates'

export async function getProjectById(
	client: TypedSupabaseClient,
	projectId: string,
) {
	// Fetch the project by ID, including its category and tags
	const { data: project, error: projectError } = await client
		.from('projects')
		.select(
			`
      id,
      title,
      description,
      image_url,
      created_at,
      current_amount,
      target_amount,
      min_investment,
      percentage_complete,
      investors_count,
      category:category_id ( * ),
      project_tag_relationships (
        tag:tag_id ( id, name, color )
      )
    `,
		)
		.eq('id', projectId)
		.single()

	if (projectError) throw projectError
	if (!project) return null

	const [pitch, team, milestones, updates, comments] = await Promise.all([
		getProjectPitch(client, projectId),
		getProjectTeam(client, projectId),
		getProjectMilestones(client, projectId),
		getProjectUpdates(client, projectId),
		getProjectQuestions(client, projectId),
	])

	return {
		id: project.id,
		title: project.title,
		description: project.description,
		image: project.image_url,
		goal: project.target_amount,
		raised: project.current_amount,
		investors: project.investors_count,
		minInvestment: project.min_investment,
		createdAt: project.created_at,
		category: project.category,
		tags: project.project_tag_relationships?.map((r) => r.tag) ?? [],
		pitch,
		team,
		milestones,
		updates,
		comments,
	}
}
