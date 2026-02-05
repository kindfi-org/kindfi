import type { TypedSupabaseClient } from '@packages/lib/types'

export async function getAllEscrows(client: TypedSupabaseClient) {
	const { data, error } = await client
		.from('escrow_contracts')
		.select(
			`
      id,
      contract_id,
      engagement_id,
      project_id,
      current_state,
      amount,
      platform_fee,
      created_at,
      updated_at,
      completed_at,
      projects:project_id (
        id,
        title,
        slug
      )
    `,
		)
		.order('created_at', { ascending: false })

	if (error) throw error

	return (
		data?.map((escrow) => ({
			id: escrow.id,
			contractId: escrow.contract_id,
			engagementId: escrow.engagement_id,
			projectId: escrow.project_id,
			currentState: escrow.current_state,
			amount: Number(escrow.amount),
			platformFee: Number(escrow.platform_fee),
			createdAt: escrow.created_at,
			updatedAt: escrow.updated_at,
			completedAt: escrow.completed_at,
			project: escrow.projects
				? {
						id: (escrow.projects as { id: string }).id,
						title: (escrow.projects as { title: string }).title,
						slug: (escrow.projects as { slug: string | null }).slug,
					}
				: null,
		})) ?? []
	)
}
