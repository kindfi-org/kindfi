import type { TypedSupabaseClient } from '@packages/lib/types'
import type { EscrowType } from '@trustless-work/escrow'
import {
	getProjectEscrowRowId,
	resolveProjectEscrowContracts,
} from '~/lib/queries/projects/resolve-project-escrow-contracts'

export type UserProjectSummary = {
	id: string
	title: string
	slug: string | null
	description: string | null
	image: string | null
	goal: number
	raised: number
	investors: number
	minInvestment: number
	createdAt: string | null
	status: string
	percentageComplete: number | null
	category: unknown
	tags: Array<{ id: string; name: string; color: string | null }>
	escrowContractAddress?: string
	escrowType?: EscrowType
}

/**
 * Get all projects created by a specific user (for creators)
 */
export async function getUserCreatedProjects(
	client: TypedSupabaseClient,
	userId: string,
): Promise<UserProjectSummary[]> {
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
				escrowContractAddress: escrow?.escrowContractAddress,
				escrowType: escrow?.escrowType,
			}
		}) ?? []
	)
}

export type UserSupportedProjectSummary = UserProjectSummary & {
	contributionAmount: number
	contributionDate: string | null
}

/**
 * Get all projects a user has contributed to (for donors)
 */
export async function getUserSupportedProjects(
	client: TypedSupabaseClient,
	userId: string,
): Promise<UserSupportedProjectSummary[]> {
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

	// Group contributions by project ID so the same project only appears once
	// with the total contributed amount and the most recent contribution date
	const projectMap = new Map<
		string,
		{
			project: {
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
				project_tag_relationships: Array<{
					tag: { id: string; name: string; color: string }
				}>
				project_escrows?: { escrow_id?: string } | Array<{ escrow_id?: string }>
			}
			totalAmount: number
			latestDate: string | null
			contributionCount: number
		}
	>()

	for (const contribution of contributions ?? []) {
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
			project_tag_relationships: Array<{
				tag: { id: string; name: string; color: string }
			}>
			project_escrows?: { escrow_id?: string } | Array<{ escrow_id?: string }>
		} | null

		if (!project?.id) {
			continue
		}

		const existing = projectMap.get(project.id)
		const amount = Number(contribution.amount ?? 0)
		const date = contribution.created_at

		if (existing) {
			existing.totalAmount += amount
			existing.contributionCount += 1
			// Keep the most recent date
			if (date && (!existing.latestDate || date > existing.latestDate)) {
				existing.latestDate = date
			}
		} else {
			projectMap.set(project.id, {
				project,
				totalAmount: amount,
				latestDate: date,
				contributionCount: 1,
			})
		}
	}

	const escrowRowIds = Array.from(projectMap.values())
		.map(({ project }) => getProjectEscrowRowId(project.project_escrows))
		.filter((id): id is string => Boolean(id))

	const escrowContracts = await resolveProjectEscrowContracts(client, escrowRowIds)

	return Array.from(projectMap.values()).map(({ project, totalAmount, latestDate }) => {
		const escrowRowId = getProjectEscrowRowId(project.project_escrows)
		const escrow = escrowRowId ? escrowContracts.get(escrowRowId) : undefined

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
			escrowContractAddress: escrow?.escrowContractAddress,
			escrowType: escrow?.escrowType,
			contributionAmount: totalAmount,
			contributionDate: latestDate,
		}
	})
}
