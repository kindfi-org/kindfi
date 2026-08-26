import type { TypedSupabaseClient } from '@packages/lib/types'
import type { EscrowType } from '@trustless-work/escrow'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import {
	fetchContentTranslation,
	fetchOppositeLocaleTranslation,
	type LocalizeOptions,
	resolveLocalizedFields,
} from '~/lib/services/content-translation'
import type { ProjectTranslationContent } from '~/lib/services/content-translation/types'
import type { SocialLinks } from '~/lib/types/project/project-detail.types'
import { readEscrowTypeFromMetadata } from '~/lib/utils/escrow/resolve-escrow-type'

export type GetBasicProjectInfoOptions = LocalizeOptions & {
	viewerLocale?: SupportedLocale
}

export async function getBasicProjectInfoBySlug(
	client: TypedSupabaseClient,
	projectSlug: string,
	options?: GetBasicProjectInfoOptions,
) {
	const { data: project, error } = await client
		.from('projects')
		.select(
			`
			id,
						kindler_id,
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
			status,
			foundation_id,
			source_locale,
			category:category_id ( * ),
			project_tag_relationships (
				tag:tag_id ( id, name, color )
			),
			project_escrows:project_escrows!left (
				escrow_id
			)
		`,
		)
		.eq('slug', projectSlug)
		.maybeSingle()

	if (error) throw error
	if (!project) return null

	const sourceLocale = ((project as { source_locale?: SupportedLocale }).source_locale ??
		'en') as SupportedLocale

	const projectTranslation =
		options?.localize !== false
			? await fetchContentTranslation(client, 'project', project.id, options?.viewerLocale ?? 'en')
			: null

	const localized = resolveLocalizedFields(
		{
			title: project.title,
			description: project.description,
		},
		sourceLocale,
		projectTranslation,
		options,
	)

	let translation: ProjectTranslationContent | undefined
	if (options?.localize === false) {
		const oppositeTranslation = await fetchOppositeLocaleTranslation(
			client,
			'project',
			project.id,
			sourceLocale,
		)
		const fields = oppositeTranslation?.fields as ProjectTranslationContent | undefined
		translation = {
			title: fields?.title ?? '',
			description: fields?.description ?? '',
		}
	}

	// Normalize project_escrows shape (it may be object or array depending on RLS/relationship)
	const escrowRel = (
		project as unknown as {
			project_escrows?: { escrow_id?: string } | Array<{ escrow_id?: string }>
		}
	).project_escrows
	const escrowId = Array.isArray(escrowRel) ? escrowRel[0]?.escrow_id : escrowRel?.escrow_id

	// Fetch the actual contract_id from escrow_contracts table
	let escrowContractAddress: string | undefined
	let escrowType: EscrowType | undefined

	if (escrowId) {
		const { data: escrowContract } = await client
			.from('escrow_contracts')
			.select('contract_id, metadata')
			.eq('id', escrowId)
			.maybeSingle()

		escrowContractAddress = escrowContract?.contract_id
		escrowType = readEscrowTypeFromMetadata(escrowContract?.metadata)
	}

	// Fetch foundation when project is assigned to one
	const foundationId = (project as { foundation_id?: string | null }).foundation_id
	let foundation: { id: string; name: string; slug: string } | undefined

	if (foundationId) {
		const { data: foundationRow } = await client
			.from('foundations')
			.select('id, name, slug, source_locale')
			.eq('id', foundationId)
			.maybeSingle()

		if (foundationRow) {
			const foundationSourceLocale =
				(foundationRow.source_locale as SupportedLocale | undefined) ?? 'en'
			const foundationTranslation =
				options?.localize !== false
					? await fetchContentTranslation(
							client,
							'foundation',
							foundationRow.id,
							options?.viewerLocale ?? 'en',
						)
					: null
			const localizedFoundation = resolveLocalizedFields(
				{ name: foundationRow.name },
				foundationSourceLocale,
				foundationTranslation,
				options,
			)

			foundation = {
				id: foundationRow.id,
				name: localizedFoundation.name ?? foundationRow.name,
				slug: foundationRow.slug,
			}
		}
	}

	return {
		id: project.id,
		kindlerId: (project as { kindler_id?: string | null }).kindler_id ?? undefined,
		title: localized.title ?? project.title,
		slug: project.slug,
		description: localized.description ?? project.description,
		image: project.image_url,
		goal: project.target_amount,
		raised: project.current_amount,
		investors: project.kinder_count,
		minInvestment: project.min_investment,
		createdAt: project.created_at,
		status: project.status,
		category: project.category,
		location: project.project_location,
		sourceLocale,
		translation,
		socialLinks:
			project.social_links && typeof project.social_links === 'object'
				? (project.social_links as SocialLinks)
				: {},
		tags: project.project_tag_relationships?.map((r) => r.tag) ?? [],
		escrowContractAddress,
		escrowType,
		foundation,
	}
}
