import { createProjectManageGetHandler } from '~/lib/api/create-project-manage-get-handler'
import { getProjectHighlights } from '~/lib/queries/projects/get-project-highlights'

export const GET = createProjectManageGetHandler((client, slug) =>
	getProjectHighlights(client, slug),
)
