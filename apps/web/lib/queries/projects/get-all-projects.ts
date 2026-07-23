import type { TypedSupabaseClient } from '@packages/lib/types'
import { sortMap } from '~/lib/constants/projects'
import {
	getProjectEscrowRowId,
	resolveProjectEscrowContracts,
} from '~/lib/queries/projects/resolve-project-escrow-contracts'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import {
	fetchContentTranslations,
	type LocalizeOptions,
	resolveLocalizedFields,
} from '~/lib/services/content-translation'
import type { Project } from '~/lib/types/project'
import { calculateReleasedAmount } from '~/lib/utils/projects/milestone-funding'

export type ProjectListItem = Project & {
	status?: string
	developmentOnly: boolean
}

export type GetAllProjectsOptions = LocalizeOptions & {
	viewerLocale?: SupportedLocale
}

export async function getAllProjects(
	client: TypedSupabaseClient,
	categorySlugs: string[] = [],
	sortSlug = 'most-popular',
	limit?: number,
	options?: GetAllProjectsOptions,
): Promise<ProjectListItem[]> {
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
      status,
      development_only,
      source_locale,
      category:category_id ( * ),
      project_tag_relationships (
        tag:tag_id ( id, name, color )
      ),
      milestones (
        amount,
        status
      ),
      project_escrows:project_escrows!left (
        escrow_id
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

	const projectIds = data?.map((project) => project.id) ?? []
	const translations =
		options?.localize !== false && projectIds.length > 0
			? await fetchContentTranslations(client, 'project', projectIds, options?.viewerLocale ?? 'en')
			: new Map()

	const escrowRowIds =
		data
			?.map((project) =>
				getProjectEscrowRowId(
					(
						project as unknown as {
							project_escrows?: { escrow_id?: string } | Array<{ escrow_id?: string }>
						}
					).project_escrows,
				),
			)
			.filter((id): id is string => Boolean(id)) ?? []

	const escrowContracts = await resolveProjectEscrowContracts(client, escrowRowIds)

	return (
		data?.map((project) => {
			const sourceLocale = (project.source_locale as SupportedLocale | undefined) ?? 'en'
			const localized = resolveLocalizedFields(
				{
					title: project.title,
					description: project.description,
				},
				sourceLocale,
				translations.get(project.id),
				options,
			)

			const escrowRowId = getProjectEscrowRowId(
				(
					project as unknown as {
						project_escrows?: { escrow_id?: string } | Array<{ escrow_id?: string }>
					}
				).project_escrows,
			)
			const escrow = escrowRowId ? escrowContracts.get(escrowRowId) : undefined

			return {
				id: project.id,
				title: localized.title ?? project.title,
				slug: project.slug,
				description: localized.description ?? project.description,
				image: project.image_url,
				goal: project.target_amount,
				raised: project.current_amount,
				investors: project.kinder_count,
				minInvestment: project.min_investment,
				createdAt: project.created_at,
				status: (project as { status?: string }).status,
				developmentOnly: Boolean((project as { development_only?: boolean }).development_only),
				category: project.category,
				tags: project.project_tag_relationships.map((r) => r.tag),
				escrowContractAddress: escrow?.escrowContractAddress,
				escrowType: escrow?.escrowType,
				releasedAmount: calculateReleasedAmount(
					(
						project as unknown as {
							milestones?: Array<{ amount: number | string | null; status: string | null }>
						}
					).milestones,
				),
			} satisfies ProjectListItem
		}) ?? []
	)
}
