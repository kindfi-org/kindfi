import type { TypedSupabaseClient } from '@packages/lib/types'
import type { Enums } from '@services/supabase'
import type { EscrowType } from '@trustless-work/escrow'
import { readEscrowTypeFromMetadata } from '~/lib/utils/escrow/resolve-escrow-type'
import type { AdminListResponse, AdminProjectsQuery } from '~/lib/validators/admin-list-params'
import { runPaginatedAdminQuery } from './run-paginated-query'

export interface AdminProjectListItem {
	id: string
	title: string
	slug: string | null
	status: Enums<'project_status'>
	imageUrl: string | null
	currentAmount: number
	targetAmount: number
	kinderCount: number
	developmentOnly: boolean
	location: string | null
	createdAt: string | null
	updatedAt: string | null
	category: { id: string; name: string } | null
	foundation: { id: string; name: string } | null
	creator: { id: string; displayName: string | null } | null
	escrow: { id: string; state: Enums<'escrow_status_type'> | null; type: EscrowType | null } | null
}

export interface AdminProjectFilterOptions {
	categories: Array<{ id: string; name: string; slug: string | null }>
	foundations: Array<{ id: string; name: string; slug: string }>
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Strips characters that would break a PostgREST `or()` expression. */
function sanitizeSearchTerm(term: string): string {
	return term.replace(/[,()%\\]/g, ' ').trim()
}

/**
 * PostgREST cannot express `title ilike X OR foundation.name ilike X` across
 * an embedded resource in a single or(), so creator/foundation name matches
 * are pre-resolved to ids. The candidate list is capped; beyond it, admins
 * can narrow the term or use the dedicated foundation filter.
 */
const RELATED_MATCH_LIMIT = 50

type ProjectRow = {
	id: string
	title: string
	slug: string | null
	status: Enums<'project_status'>
	image_url: string | null
	current_amount: number | null
	target_amount: number | null
	kinder_count: number | null
	development_only: boolean
	project_location: string | null
	created_at: string | null
	updated_at: string | null
	kindler_id: string | null
	category: { id: string; name: string } | null
	foundation: { id: string; name: string } | null
	// One-to-one embed: PostgREST returns an object because project_escrows
	// has a unique constraint on project_id.
	project_escrows: {
		escrow: {
			id: string
			current_state: Enums<'escrow_status_type'> | null
			metadata: unknown
		} | null
	} | null
}

/**
 * Paginated, filterable admin project list. All filtering, searching,
 * sorting, and pagination happen in the database — no 1,000-row fetches.
 */
export async function getAdminProjects(
	client: TypedSupabaseClient,
	params: AdminProjectsQuery,
): Promise<AdminListResponse<AdminProjectListItem>> {
	// A specific escrow-state filter (or 'any') switches the embed to an inner
	// join so the state predicate runs in the database — no intermediate id
	// expansion that could truncate results.
	const escrowJoin =
		params.escrow && params.escrow !== 'none'
			? 'project_escrows!inner(escrow:escrow_contracts!inner(id, current_state, metadata))'
			: 'project_escrows!left(escrow:escrow_contracts(id, current_state, metadata))'

	// Related-record lookups happen once, before the (re-runnable) builder.
	let categoryId: string | null | undefined
	if (params.category) {
		const { data: category } = await client
			.from('categories')
			.select('id')
			.eq('slug', params.category)
			.maybeSingle()
		categoryId = category?.id ?? '00000000-0000-0000-0000-000000000000'
	}

	let foundationId: string | null | undefined
	if (params.foundation) {
		const { data: foundation } = await client
			.from('foundations')
			.select('id')
			.eq('slug', params.foundation)
			.maybeSingle()
		foundationId = foundation?.id ?? '00000000-0000-0000-0000-000000000000'
	}

	let searchConditions: string | null = null
	let searchId: string | null = null
	if (params.q) {
		const raw = params.q.trim()
		const term = sanitizeSearchTerm(raw)
		if (UUID_PATTERN.test(raw)) {
			searchId = raw
		} else if (term) {
			// Creator and foundation matches are resolved to ids first because
			// PostgREST cannot ilike across embedded resources in an or().
			const [foundationMatches, creatorMatches] = await Promise.all([
				client
					.from('foundations')
					.select('id')
					.ilike('name', `%${term}%`)
					.limit(RELATED_MATCH_LIMIT),
				client
					.from('profiles')
					.select('id')
					.ilike('display_name', `%${term}%`)
					.limit(RELATED_MATCH_LIMIT),
			])
			const conditions = [`title.ilike.%${term}%`, `slug.ilike.%${term}%`]
			const foundationIds = (foundationMatches.data ?? []).map((row) => row.id)
			if (foundationIds.length > 0) {
				conditions.push(`foundation_id.in.(${foundationIds.join(',')})`)
			}
			const creatorIds = (creatorMatches.data ?? []).map((row) => row.id)
			if (creatorIds.length > 0) {
				conditions.push(`kindler_id.in.(${creatorIds.join(',')})`)
			}
			searchConditions = conditions.join(',')
		}
	}

	const runQuery = (from: number, to: number) => {
		let query = client.from('projects').select(
			`id, title, slug, status, image_url, current_amount, target_amount, kinder_count,
				 development_only, project_location, created_at, updated_at,
				 kindler_id,
				 category:categories(id, name),
				 foundation:foundations(id, name),
				 ${escrowJoin}`,
			{ count: 'exact' },
		)

		if (params.status) query = query.eq('status', params.status)
		if (params.devOnly) query = query.eq('development_only', params.devOnly === 'true')
		if (categoryId) query = query.eq('category_id', categoryId)
		if (foundationId) query = query.eq('foundation_id', foundationId)
		if (params.from) query = query.gte('created_at', `${params.from}T00:00:00.000Z`)
		if (params.to) query = query.lte('created_at', `${params.to}T23:59:59.999Z`)

		if (params.escrow === 'none') {
			query = query.is('project_escrows', null)
		} else if (params.escrow && params.escrow !== 'any') {
			// 'any' needs no extra predicate — the inner join already restricts to
			// projects with an escrow.
			query = query.eq('project_escrows.escrow.current_state', params.escrow)
		}

		if (searchId) query = query.eq('id', searchId)
		if (searchConditions) query = query.or(searchConditions)

		switch (params.sort) {
			case 'oldest':
				query = query.order('created_at', { ascending: true })
				break
			case 'funding':
				query = query.order('current_amount', { ascending: false, nullsFirst: false })
				break
			case 'target':
				query = query.order('target_amount', { ascending: false, nullsFirst: false })
				break
			case 'status':
				query = query.order('status', { ascending: true }).order('created_at', { ascending: false })
				break
			default:
				query = query.order('created_at', { ascending: false })
		}

		return query.range(from, to)
	}

	const { rows: rawRows, total } = await runPaginatedAdminQuery<ProjectRow>(
		runQuery,
		params.page,
		params.pageSize,
		'admin projects',
	)

	const rows = rawRows

	// projects.kindler_id has no FK to profiles, so creator names are
	// resolved with a second lookup over the current page instead of an embed.
	const creatorIds = [...new Set(rows.map((row) => row.kindler_id).filter(Boolean))] as string[]
	const creatorsById = new Map<string, { id: string; display_name: string | null }>()
	if (creatorIds.length > 0) {
		const { data: creators } = await client
			.from('profiles')
			.select('id, display_name')
			.in('id', creatorIds)
		for (const creator of creators ?? []) {
			creatorsById.set(creator.id, creator)
		}
	}

	return {
		items: rows.map((row) => {
			const escrowRelation = row.project_escrows?.escrow ?? null
			return {
				id: row.id,
				title: row.title,
				slug: row.slug,
				status: row.status,
				imageUrl: row.image_url,
				currentAmount: Number(row.current_amount ?? 0),
				targetAmount: Number(row.target_amount ?? 0),
				kinderCount: Number(row.kinder_count ?? 0),
				developmentOnly: row.development_only,
				location: row.project_location,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
				category: row.category,
				foundation: row.foundation,
				creator: row.kindler_id
					? {
							id: row.kindler_id,
							displayName: creatorsById.get(row.kindler_id)?.display_name ?? null,
						}
					: null,
				escrow: escrowRelation
					? {
							id: escrowRelation.id,
							state: escrowRelation.current_state,
							type: readEscrowTypeFromMetadata(escrowRelation.metadata) ?? null,
						}
					: null,
			}
		}),
		total,
		page: params.page,
		pageSize: params.pageSize,
	}
}

/**
 * Option lists for the projects filter bar (small lookup tables).
 */
export async function getAdminProjectFilterOptions(
	client: TypedSupabaseClient,
): Promise<AdminProjectFilterOptions> {
	const [categories, foundations] = await Promise.all([
		client.from('categories').select('id, name, slug').order('name'),
		client.from('foundations').select('id, name, slug').order('name'),
	])

	return {
		categories: categories.data ?? [],
		foundations: foundations.data ?? [],
	}
}
