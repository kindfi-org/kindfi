import { createProjectManageGetHandler } from '~/lib/api/create-project-manage-get-handler'
import { getProjectTeamBySlug } from '~/lib/queries/projects/get-project-team-by-slug'

export const GET = createProjectManageGetHandler((client, slug) =>
	getProjectTeamBySlug(client, slug),
)
