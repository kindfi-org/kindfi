import type { TypedSupabaseClient } from '@packages/lib/types'
import type { SocialLinks } from '~/lib/types/project/project-detail.types'

export async function getBasicProjectInfoBySlug(
	client: TypedSupabaseClient,
	projectSlug: string,
) {
	const { data: project, error } = await client
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
			project_location,
			social_links,
			category:category_id ( * ),
			project_tag_relationships (
				tag:tag_id ( id, name, color )
			),
			project_escrows:project_escrows!left (
				escrow:escrow_id (
					contract_id,
					metadata
				)
			)
		`,
		)
		.eq('slug', projectSlug)
		.single()

	if (error) throw error
	if (!project) return null

	// Normalize project_escrows shape (it may be object or array depending on RLS/relationship)
	const escrowRel = (project as unknown as {
		project_escrows?:
			| { escrow?: { contract_id?: string; metadata?: unknown } }
			| Array<{ escrow?: { contract_id?: string; metadata?: unknown } }>
	}).project_escrows
	const escrowObj = Array.isArray(escrowRel)
		? escrowRel[0]?.escrow
		: escrowRel?.escrow

	// TODO: Remove this default, every escrow id should come from the supabase project table. 
	const DEFAULT_ESCROW_CONTRACT_ADDRESS =
		'CC4I2AH4AJQ3KVTFD7SJZWRQEL3DSLQA7UDR6TO44HXZPDMTXWPJ6QH7'

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
		location: project.project_location,
		socialLinks:
			project.social_links && typeof project.social_links === 'object'
				? (project.social_links as SocialLinks)
				: {},
		tags: project.project_tag_relationships?.map((r) => r.tag) ?? [],
		escrowContractAddress:
			escrowObj?.contract_id || DEFAULT_ESCROW_CONTRACT_ADDRESS,
		escrowType: ((): import('@trustless-work/escrow').EscrowType | undefined => {
			const meta = escrowObj?.metadata as Record<string, unknown> | undefined
			const value = meta?.escrowType
			return (typeof value === 'string' ? (value as unknown as import('@trustless-work/escrow').EscrowType) : undefined)
		})(),
	}
}
