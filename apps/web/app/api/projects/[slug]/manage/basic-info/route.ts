import { createProjectManageGetHandler } from '~/lib/api/create-project-manage-get-handler'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'

export const GET = createProjectManageGetHandler((client, slug) =>
	getBasicProjectInfoBySlug(client, slug, { localize: false }),
)
