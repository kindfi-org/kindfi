import { createProjectManageGetHandler } from '~/lib/api/create-project-manage-get-handler'
import { getProjectUpdatesForManage } from '~/lib/queries/projects/get-project-updates-for-manage'

export const GET = createProjectManageGetHandler((client, slug) =>
	getProjectUpdatesForManage(client, slug),
)
