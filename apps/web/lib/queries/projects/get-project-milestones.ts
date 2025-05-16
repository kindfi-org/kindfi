import type { TypedSupabaseClient } from '@packages/lib/types'
import type { Milestone } from '~/lib/types/project/project-detail.types'

export async function getProjectMilestones(
	client: TypedSupabaseClient,
	projectId: string,
): Promise<Milestone[]> {
	const { data, error } = await client
		.from('milestones')
		.select('id, title, description, amount, deadline, status, order_index')
		.eq('project_id', projectId)
		.order('order_index')

	if (error) throw error

	return (data ?? []).map((m) => ({
		id: m.id,
		title: m.title,
		description: m.description,
		amount: m.amount,
		deadline: m.deadline,
		status: m.status,
		orderIndex: m.order_index,
	}))
}
