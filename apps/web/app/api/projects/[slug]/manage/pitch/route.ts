import { createProjectManageGetHandler } from '~/lib/api/create-project-manage-get-handler'
import { getProjectPitchDataBySlug } from '~/lib/queries/projects/get-project-pitch-data-by-slug'

export const GET = createProjectManageGetHandler((client, slug) =>
	getProjectPitchDataBySlug(client, slug),
)
