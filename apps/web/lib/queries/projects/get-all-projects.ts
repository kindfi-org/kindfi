import type { TypedSupabaseClient } from '@packages/lib/types'
import { sortMap } from '~/lib/constants/projects'

export async function getAllProjects(
	client: TypedSupabaseClient,
	categorySlugs: string[] = [],
	sortSlug = 'most-popular',
	limit?: number,
) {
	const { column, ascending } = sortMap[sortSlug] ?? sortMap['most-popular']

	let query = client
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
      category:category_id ( * ),
      project_tag_relationships (
        tag:tag_id ( id, name, color )
      ),
      project_escrows:project_escrows!left (
        escrow:escrow_id (
          contract_id
        )
      )
    `,
		)
		.order(column, { ascending })

	if (categorySlugs.length > 0) {
		const { data: categories, error: catErr } = await client
			.from('categories')
			.select('id')
			.in('slug', categorySlugs)

		if (catErr) throw catErr
		const categoryIds = categories?.map((c) => c.id) ?? []

		if (categoryIds.length > 0) {
			query = query.in('category_id', categoryIds)
		}
	}

	if (limit) {
		query = query.limit(limit)
	}

	const { data, error } = await query

	if (error) throw error

	// TODO: Remove this default, every escrow id should come from the supabase project table. 
	const DEFAULT_ESCROW_CONTRACT_ADDRESS =
		'CC4I2AH4AJQ3KVTFD7SJZWRQEL3DSLQA7UDR6TO44HXZPDMTXWPJ6QH7'

	return (
		data?.map((project) => {
			const escrowRel = (project as unknown as {
				project_escrows?:
					| { escrow?: { contract_id?: string } }
					| Array<{ escrow?: { contract_id?: string } }>
			}).project_escrows
			const escrow = Array.isArray(escrowRel) ? escrowRel[0]?.escrow : escrowRel?.escrow

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
				category: project.category,
				tags: project.project_tag_relationships.map((r) => r.tag),
				escrowContractAddress: escrow?.contract_id || DEFAULT_ESCROW_CONTRACT_ADDRESS,
			}
		}) ?? []
	)
}
