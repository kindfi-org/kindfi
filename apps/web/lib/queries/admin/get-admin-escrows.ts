import type { TypedSupabaseClient } from '@packages/lib/types'
import type { Enums } from '@services/supabase'
import type { EscrowType } from '@trustless-work/escrow'
import { readEscrowTypeFromMetadata } from '~/lib/utils/escrow/resolve-escrow-type'
import type { AdminEscrowsQuery, AdminListResponse } from '~/lib/validators/admin-list-params'

export type AdminEscrowHealthIssue = 'missing_association' | 'orphaned_project'

export interface AdminEscrowListItem {
	id: string
	contractId: string
	engagementId: string
	state: Enums<'escrow_status_type'> | null
	type: EscrowType | null
	amount: number
	platformFee: number
	createdAt: string | null
	updatedAt: string | null
	completedAt: string | null
	releaseCount: number
	project: {
		id: string
		title: string
		slug: string | null
		status: Enums<'project_status'>
		imageUrl: string | null
	} | null
	health: {
		healthy: boolean
		issues: AdminEscrowHealthIssue[]
	}
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function sanitizeSearchTerm(term: string): string {
	return term.replace(/[,()%\\]/g, ' ').trim()
}

const RELATED_MATCH_LIMIT = 20

type EscrowRow = {
	id: string
	contract_id: string
	engagement_id: string
	current_state: Enums<'escrow_status_type'> | null
	amount: number | null
	platform_fee: number | null
	metadata: unknown
	created_at: string | null
	updated_at: string | null
	completed_at: string | null
	project: {
		id: string
		title: string
		slug: string | null
		status: Enums<'project_status'>
		image_url: string | null
	} | null
	// One-to-one embed (unique constraint on project_escrows.escrow_id).
	project_escrows: { escrow_id: string } | null
	escrow_milestones: Array<{ count: number }> | null
}

/**
 * Paginated, project-oriented admin escrow list. The associated project is
 * embedded so campaigns are recognizable at a glance, and association
 * health is computed per row: an escrow whose `project_escrows` join row is
 * missing (or whose project cannot be resolved) is flagged instead of being
 * presented as an ordinary healthy escrow. No on-chain calls happen here —
 * indexer detail loads only when a row is expanded.
 */
export async function getAdminEscrows(
	client: TypedSupabaseClient,
	params: AdminEscrowsQuery,
): Promise<AdminListResponse<AdminEscrowListItem>> {
	let query = client.from('escrow_contracts').select(
		`id, contract_id, engagement_id, current_state, amount, platform_fee, metadata,
			 created_at, updated_at, completed_at,
			 project:projects!escrow_contracts_project_id_fkey(id, title, slug, status, image_url),
			 project_escrows!left(escrow_id),
			 escrow_milestones(count)`,
		{ count: 'exact' },
	)

	if (params.state) {
		query = query.eq('current_state', params.state)
	}

	if (params.project) {
		const { data: project } = await client
			.from('projects')
			.select('id')
			.eq('slug', params.project)
			.maybeSingle()
		query = query.eq('project_id', project?.id ?? '00000000-0000-0000-0000-000000000000')
	}

	if (params.q) {
		const term = sanitizeSearchTerm(params.q)
		if (UUID_PATTERN.test(params.q.trim())) {
			query = query.or(`id.eq.${params.q.trim()},project_id.eq.${params.q.trim()}`)
		} else if (term) {
			// Project-title matches are resolved to ids first (PostgREST cannot
			// ilike across embedded resources inside an or()).
			const { data: projectMatches } = await client
				.from('projects')
				.select('id')
				.ilike('title', `%${term}%`)
				.limit(RELATED_MATCH_LIMIT)
			const conditions = [`contract_id.ilike.%${term}%`, `engagement_id.ilike.%${term}%`]
			const projectIds = (projectMatches ?? []).map((row) => row.id)
			if (projectIds.length > 0) {
				conditions.push(`project_id.in.(${projectIds.join(',')})`)
			}
			query = query.or(conditions.join(','))
		}
	}

	switch (params.sort) {
		case 'oldest':
			query = query.order('created_at', { ascending: true })
			break
		case 'updated':
			query = query.order('updated_at', { ascending: false, nullsFirst: false })
			break
		case 'amount':
			query = query.order('amount', { ascending: false, nullsFirst: false })
			break
		default:
			query = query.order('created_at', { ascending: false })
	}

	const offset = (params.page - 1) * params.pageSize
	query = query.range(offset, offset + params.pageSize - 1)

	const { data, error, count } = await query

	if (error) {
		throw new Error(`Failed to load admin escrows: ${error.message}`)
	}

	const rows = (data ?? []) as unknown as EscrowRow[]

	return {
		items: rows.map((row) => {
			const issues: AdminEscrowHealthIssue[] = []
			if (!row.project_escrows) issues.push('missing_association')
			if (!row.project) issues.push('orphaned_project')

			return {
				id: row.id,
				contractId: row.contract_id,
				engagementId: row.engagement_id,
				state: row.current_state,
				type: readEscrowTypeFromMetadata(row.metadata) ?? null,
				amount: Number(row.amount ?? 0),
				platformFee: Number(row.platform_fee ?? 0),
				createdAt: row.created_at,
				updatedAt: row.updated_at,
				completedAt: row.completed_at,
				releaseCount: row.escrow_milestones?.[0]?.count ?? 0,
				project: row.project
					? {
							id: row.project.id,
							title: row.project.title,
							slug: row.project.slug,
							status: row.project.status,
							imageUrl: row.project.image_url,
						}
					: null,
				health: { healthy: issues.length === 0, issues },
			}
		}),
		total: count ?? 0,
		page: params.page,
		pageSize: params.pageSize,
	}
}
