import { createProjectManageGetHandler } from '~/lib/api/create-project-manage-get-handler'
import { getEscrowCountByProject } from '~/lib/queries/escrow/get-escrow-count-by-project'

export const GET = createProjectManageGetHandler((_client, _slug, projectId) =>
	getEscrowCountByProject(_client, projectId),
)
