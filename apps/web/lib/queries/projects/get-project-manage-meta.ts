import type { TypedSupabaseClient } from '@packages/lib/types'
import { logger } from '@/lib/logger'

export interface ProjectManageMeta {
	id: string
	title: string
	slug: string
	imageUrl: string | null
	kindlerId: string | null
	categoryName: string | null
	hasEscrow: boolean
	foundation: { name: string; slug: string } | null
}

/**
 * Lightweight fetch for manage layout: identity + context chips only.
 */
export async function getProjectManageMeta(
	client: TypedSupabaseClient,
	slug: string,
): Promise<ProjectManageMeta | null> {
	const { data, error } = await client
		.from('projects')
		.select(
			`
			id,
			title,
			slug,
			image_url,
			kindler_id,
			foundation_id,
			category:category_id ( name ),
			project_escrows:project_escrows!left ( escrow_id )
		`,
		)
		.eq('slug', slug)
		.maybeSingle()

	if (error) {
		logger.error('Error fetching project manage meta:', error)
		throw error
	}

	if (!data) {
		return null
	}

	const escrowRel = (
		data as unknown as {
			project_escrows?: { escrow_id?: string } | Array<{ escrow_id?: string }>
		}
	).project_escrows
	const hasEscrow = Array.isArray(escrowRel)
		? Boolean(escrowRel[0]?.escrow_id)
		: Boolean(escrowRel?.escrow_id)

	const category = data.category as { name?: string } | null
	const foundationId = (data as { foundation_id?: string | null }).foundation_id
	let foundation: { name: string; slug: string } | null = null

	if (foundationId) {
		const { data: foundationRow } = await client
			.from('foundations')
			.select('name, slug')
			.eq('id', foundationId)
			.maybeSingle()

		if (foundationRow) {
			foundation = { name: foundationRow.name, slug: foundationRow.slug }
		}
	}

	return {
		id: data.id,
		title: data.title,
		slug: data.slug,
		imageUrl: data.image_url,
		kindlerId: (data as { kindler_id?: string | null }).kindler_id ?? null,
		categoryName: category?.name ?? null,
		hasEscrow,
		foundation,
	}
}
