import type { TypedSupabaseClient } from '@packages/lib/types'

/**
 * Get all projects created by a specific user (for creators)
 */
export async function getUserCreatedProjects(
	client: TypedSupabaseClient,
	userId: string,
) {
	const { data, error } = await client
		.from('projects')
		.select(
			`
			id,
			title,
			slug,
			description,
			image_url,
			created_at,
			current_amount,
			target_amount,
			min_investment,
			percentage_complete,
			kinder_count,
			status,
			category:category_id ( * ),
			project_tag_relationships (
				tag:tag_id ( id, name, color )
			),
			project_escrows:project_escrows!left (
				escrow_id
			)
		`,
		)
		.eq('kindler_id', userId)
		.order('created_at', { ascending: false })

	if (error) throw error

	return (
		data?.map((project) => {
			const escrowRel = (
				project as unknown as {
					project_escrows?:
						| { escrow_id?: string }
						| Array<{ escrow_id?: string }>
				}
			).project_escrows

			const escrowId = Array.isArray(escrowRel)
				? escrowRel[0]?.escrow_id
				: escrowRel?.escrow_id

			return {
				id: project.id,
				title: project.title,
				slug: project.slug,
				description: project.description,
				image: project.image_url,
				goal: project.target_amount,
				raised: project.current_amount,
				investors: project.kinder_count,
				minInvestment: project.min_investment,
				createdAt: project.created_at,
				status: project.status,
				percentageComplete: project.percentage_complete,
				category: project.category,
				tags: project.project_tag_relationships?.map((r) => r.tag) ?? [],
				escrowContractAddress: escrowId,
			}
		}) ?? []
	)
}

/**
 * Get all projects a user has contributed to (for donors)
 */
export async function getUserSupportedProjects(
	client: TypedSupabaseClient,
	userId: string,
) {
	const { data: contributions, error: contributionsError } = await client
		.from('contributions')
		.select(
			`
			id,
			amount,
			created_at,
			project_id,
			project:project_id (
				id,
				title,
				slug,
				description,
				image_url,
				created_at,
				current_amount,
				target_amount,
				min_investment,
				percentage_complete,
				kinder_count,
				status,
				category:category_id ( * ),
				project_tag_relationships (
					tag:tag_id ( id, name, color )
				),
				project_escrows:project_escrows!left (
					escrow_id
				)
			)
		`,
		)
		.eq('contributor_id', userId)
		.order('created_at', { ascending: false })

	if (contributionsError) throw contributionsError

	return (
		contributions?.map((contribution) => {
			const project = contribution.project as unknown as {
				id: string
				title: string
				slug: string
				description: string
				image_url: string
				created_at: string
				current_amount: number
				target_amount: number
				min_investment: number
				percentage_complete: number
				kinder_count: number
				status: string
				category: unknown
				project_tag_relationships: Array<{ tag: { id: string; name: string; color: string } }>
				project_escrows?: { escrow_id?: string } | Array<{ escrow_id?: string }>
			}

			const escrowRel = project.project_escrows
			const escrowId = Array.isArray(escrowRel)
				? escrowRel[0]?.escrow_id
				: escrowRel?.escrow_id

			return {
				id: project.id,
				title: project.title,
				slug: project.slug,
				description: project.description,
				image: project.image_url,
				goal: project.target_amount,
				raised: project.current_amount,
				investors: project.kinder_count,
				minInvestment: project.min_investment,
				createdAt: project.created_at,
				status: project.status,
				percentageComplete: project.percentage_complete,
				category: project.category,
				tags: project.project_tag_relationships?.map((r) => r.tag) ?? [],
				escrowContractAddress: escrowId,
				contributionAmount: contribution.amount,
				contributionDate: contribution.created_at,
			}
		}) ?? []
	)
}

