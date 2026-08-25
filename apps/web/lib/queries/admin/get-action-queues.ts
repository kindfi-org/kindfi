import type { TypedSupabaseClient } from '@packages/lib/types'
import type { Enums } from '@services/supabase'
import type { AdminAction } from '~/lib/admin/project-actions'
import { getProjectPrimaryAction, projectManageSectionHref } from '~/lib/admin/project-actions'

export const ADMIN_QUEUE_KEYS = [
	'project_reviews',
	'missing_escrows',
	'milestone_reviews',
	'escrow_attention',
	'kyc_cases',
	'new_users',
	'stale_drafts',
	'paused_projects',
] as const

export type AdminQueueKey = (typeof ADMIN_QUEUE_KEYS)[number]

export type AdminQueuePriority = 'high' | 'medium' | 'low'

export interface AdminQueueItem {
	id: string
	queue: AdminQueueKey
	/** What requires attention. */
	title: string
	/** Associated project, user, foundation, or escrow. */
	subtitle: string | null
	status: string
	statusKind: 'project' | 'escrow' | 'kyc' | 'review' | 'role'
	/** ISO timestamp the item has been waiting since. */
	waitingSince: string | null
	priority: AdminQueuePriority
	primaryAction: AdminAction
	viewHref: string | null
}

export interface AdminQueueSection {
	key: AdminQueueKey
	title: string
	description: string
	total: number
	items: AdminQueueItem[]
	/** Set when this queue's query failed; other queues still render. */
	error: boolean
	viewAllHref: string
}

const QUEUE_ITEM_LIMIT = 6

const DAY_MS = 24 * 60 * 60 * 1000

export function daysWaiting(waitingSince: string | null, now: Date): number {
	if (!waitingSince) return 0
	const started = new Date(waitingSince).getTime()
	if (Number.isNaN(started)) return 0
	return Math.max(0, (now.getTime() - started) / DAY_MS)
}

/**
 * Priority derivation for queue items. Pure so it can be unit-tested:
 * urgency grows with waiting time, and inherently risky states (disputed or
 * orphaned escrows, live campaigns without an escrow) are always high.
 */
export function deriveQueuePriority(queue: AdminQueueKey, days: number): AdminQueuePriority {
	switch (queue) {
		case 'escrow_attention':
			return 'high'
		case 'missing_escrows':
			return 'high'
		case 'project_reviews':
			if (days >= 3) return 'high'
			if (days >= 1) return 'medium'
			return 'low'
		case 'milestone_reviews':
			if (days >= 2) return 'high'
			return 'medium'
		case 'kyc_cases':
			if (days >= 3) return 'high'
			return 'medium'
		case 'paused_projects':
			return 'medium'
		default:
			return 'low'
	}
}

type ProjectQueueRow = {
	id: string
	title: string
	slug: string | null
	status: Enums<'project_status'>
	created_at: string | null
	updated_at: string | null
}

function projectQueueItem(
	queue: AdminQueueKey,
	row: ProjectQueueRow,
	options: { hasEscrow: boolean; waitingSince: string | null; now: Date },
): AdminQueueItem {
	return {
		id: `${queue}:${row.id}`,
		queue,
		title: row.title,
		subtitle: row.slug ? `/projects/${row.slug}` : null,
		status: row.status,
		statusKind: 'project',
		waitingSince: options.waitingSince,
		priority: deriveQueuePriority(queue, daysWaiting(options.waitingSince, options.now)),
		primaryAction: getProjectPrimaryAction({
			status: row.status,
			slug: row.slug,
			hasEscrow: options.hasEscrow,
		}),
		viewHref: row.slug ? `/projects/${row.slug}` : null,
	}
}

async function getProjectReviewQueue(
	client: TypedSupabaseClient,
	now: Date,
): Promise<AdminQueueSection> {
	const { data, error, count } = await client
		.from('projects')
		.select('id, title, slug, status, created_at, updated_at', { count: 'exact' })
		.eq('status', 'review')
		.order('created_at', { ascending: true })
		.limit(QUEUE_ITEM_LIMIT)

	if (error) throw error

	return {
		key: 'project_reviews',
		title: 'Projects awaiting review',
		description: 'Campaigns submitted for approval, oldest first.',
		total: count ?? 0,
		error: false,
		viewAllHref: '/admin/projects?status=review',
		items: (data ?? []).map((row) =>
			projectQueueItem('project_reviews', row, {
				hasEscrow: false,
				waitingSince: row.created_at,
				now,
			}),
		),
	}
}

async function getMissingEscrowQueue(
	client: TypedSupabaseClient,
	now: Date,
): Promise<AdminQueueSection> {
	const { data, error, count } = await client
		.from('projects')
		.select('id, title, slug, status, created_at, updated_at, project_escrows!left(project_id)', {
			count: 'exact',
		})
		.in('status', ['active', 'funded'])
		.is('project_escrows', null)
		.order('updated_at', { ascending: true })
		.limit(QUEUE_ITEM_LIMIT)

	if (error) throw error

	return {
		key: 'missing_escrows',
		title: 'Active projects without an escrow',
		description: 'Live campaigns that cannot receive escrowed funds yet.',
		total: count ?? 0,
		error: false,
		viewAllHref: '/admin/projects?escrow=none&status=active',
		items: (data ?? []).map((row) =>
			projectQueueItem('missing_escrows', row, {
				hasEscrow: false,
				waitingSince: row.updated_at,
				now,
			}),
		),
	}
}

async function getMilestoneReviewQueue(
	client: TypedSupabaseClient,
	now: Date,
): Promise<AdminQueueSection> {
	const { data, error, count } = await client
		.from('milestone_review_requests')
		.select(
			'id, status, milestone_index, milestone_title, created_at, project:projects!milestone_review_requests_project_id_fkey(title, slug)',
			{ count: 'exact' },
		)
		.eq('status', 'pending')
		.order('created_at', { ascending: true })
		.limit(QUEUE_ITEM_LIMIT)

	if (error) throw error

	return {
		key: 'milestone_reviews',
		title: 'Pending milestone reviews',
		description: 'Release review requests waiting for an admin decision.',
		total: count ?? 0,
		error: false,
		viewAllHref: '/admin/milestone-reviews?status=pending',
		items: (data ?? []).map((row) => ({
			id: `milestone_reviews:${row.id}`,
			queue: 'milestone_reviews' as const,
			title: `Release ${row.milestone_index + 1}${row.milestone_title ? `: ${row.milestone_title}` : ''}`,
			subtitle: row.project?.title ?? null,
			status: row.status,
			statusKind: 'review' as const,
			waitingSince: row.created_at,
			priority: deriveQueuePriority('milestone_reviews', daysWaiting(row.created_at, now)),
			primaryAction: { label: 'Review milestone', href: '/admin/milestone-reviews?status=pending' },
			viewHref: row.project?.slug
				? projectManageSectionHref('escrow-manage', row.project.slug)
				: null,
		})),
	}
}

async function getEscrowAttentionQueue(client: TypedSupabaseClient): Promise<AdminQueueSection> {
	const [disputed, orphaned] = await Promise.all([
		client
			.from('escrow_contracts')
			.select(
				'id, contract_id, current_state, amount, updated_at, project:projects!escrow_contracts_project_id_fkey(title, slug)',
				{ count: 'exact' },
			)
			.eq('current_state', 'DISPUTED')
			.order('updated_at', { ascending: true })
			.limit(QUEUE_ITEM_LIMIT),
		// escrow_contracts.project_id is NOT NULL, so a broken association
		// manifests as a contract with no project_escrows join row.
		client
			.from('escrow_contracts')
			.select(
				'id, contract_id, current_state, amount, updated_at, project_escrows!left(escrow_id)',
				{
					count: 'exact',
				},
			)
			.is('project_escrows', null)
			.order('updated_at', { ascending: true })
			.limit(QUEUE_ITEM_LIMIT),
	])

	if (disputed.error) throw disputed.error
	if (orphaned.error) throw orphaned.error

	const disputedItems: AdminQueueItem[] = (disputed.data ?? []).map((row) => ({
		id: `escrow_attention:${row.id}`,
		queue: 'escrow_attention' as const,
		title: 'Disputed escrow',
		subtitle: row.project?.title ?? row.contract_id,
		status: row.current_state ?? 'DISPUTED',
		statusKind: 'escrow' as const,
		waitingSince: row.updated_at,
		priority: 'high' as const,
		primaryAction: row.project?.slug
			? {
					label: 'Resolve dispute',
					href: projectManageSectionHref('escrow-manage', row.project.slug),
				}
			: { label: 'View escrows', href: '/admin/escrows?state=DISPUTED' },
		viewHref: '/admin/escrows?state=DISPUTED',
	}))

	const orphanedItems: AdminQueueItem[] = (orphaned.data ?? []).map((row) => ({
		id: `escrow_attention:orphan:${row.id}`,
		queue: 'escrow_attention' as const,
		title: 'Escrow with a broken project association',
		subtitle: row.contract_id,
		status: row.current_state ?? 'NEW',
		statusKind: 'escrow' as const,
		waitingSince: row.updated_at,
		priority: 'high' as const,
		primaryAction: { label: 'Inspect escrow', href: '/admin/escrows' },
		viewHref: '/admin/escrows',
	}))

	return {
		key: 'escrow_attention',
		title: 'Escrows requiring attention',
		description: 'Disputed contracts and escrows with a broken project association.',
		total: (disputed.count ?? 0) + (orphaned.count ?? 0),
		error: false,
		viewAllHref: '/admin/escrows',
		items: [...disputedItems, ...orphanedItems].slice(0, QUEUE_ITEM_LIMIT),
	}
}

async function getKycQueue(client: TypedSupabaseClient, now: Date): Promise<AdminQueueSection> {
	const { data, error, count } = await client
		.from('kyc_reviews')
		.select('id, user_id, status, verification_level, created_at, updated_at', { count: 'exact' })
		.in('status', ['pending', 'rejected'])
		.order('created_at', { ascending: true })
		.limit(QUEUE_ITEM_LIMIT)

	if (error) throw error

	const rows = data ?? []
	const userIds = [...new Set(rows.map((row) => row.user_id))]

	// kyc_reviews has no FK to profiles (it references auth.users), so the
	// display name is resolved with a second lookup instead of an embed.
	const profilesById = new Map<string, { display_name: string | null; email: string | null }>()
	if (userIds.length > 0) {
		const { data: profiles } = await client
			.from('profiles')
			.select('id, display_name, email')
			.in('id', userIds)
		for (const profile of profiles ?? []) {
			profilesById.set(profile.id, profile)
		}
	}

	return {
		key: 'kyc_cases',
		title: 'KYC cases',
		description: 'Verifications pending review or rejected.',
		total: count ?? 0,
		error: false,
		viewAllHref: '/admin/users?kyc=pending',
		items: rows.map((row) => {
			const profile = profilesById.get(row.user_id)
			return {
				id: `kyc_cases:${row.id}`,
				queue: 'kyc_cases' as const,
				title: profile?.display_name || profile?.email || 'Unknown user',
				subtitle: `KYC ${row.status} · ${row.verification_level}`,
				status: row.status,
				statusKind: 'kyc' as const,
				waitingSince: row.created_at,
				priority: deriveQueuePriority('kyc_cases', daysWaiting(row.created_at, now)),
				primaryAction: {
					label: 'View KYC status',
					href: `/admin/users?kyc=${row.status === 'rejected' ? 'rejected' : 'pending'}`,
				},
				viewHref: `/admin/users?q=${row.user_id}`,
			}
		}),
	}
}

async function getNewUsersQueue(
	client: TypedSupabaseClient,
	now: Date,
): Promise<AdminQueueSection> {
	const since = new Date(now.getTime() - 7 * DAY_MS).toISOString()
	const { data, error, count } = await client
		.from('profiles')
		.select('id, display_name, email, slug, role, created_at', { count: 'exact' })
		.gte('created_at', since)
		.order('created_at', { ascending: false })
		.limit(QUEUE_ITEM_LIMIT)

	if (error) throw error

	return {
		key: 'new_users',
		title: 'New users',
		description: 'Sign-ups from the last 7 days.',
		total: count ?? 0,
		error: false,
		viewAllHref: '/admin/users?sort=newest',
		items: (data ?? []).map((row) => ({
			id: `new_users:${row.id}`,
			queue: 'new_users' as const,
			title: row.display_name || row.email || 'Unnamed user',
			subtitle: row.email,
			status: row.role ?? 'pending',
			statusKind: 'role' as const,
			waitingSince: row.created_at,
			priority: 'low' as const,
			primaryAction: { label: 'View user', href: `/admin/users?q=${row.id}` },
			viewHref: row.slug ? `/u/${row.slug}` : null,
		})),
	}
}

const STALE_DRAFT_DAYS = 14

async function getStaleDraftQueue(
	client: TypedSupabaseClient,
	now: Date,
): Promise<AdminQueueSection> {
	const cutoff = new Date(now.getTime() - STALE_DRAFT_DAYS * DAY_MS).toISOString()
	const { data, error, count } = await client
		.from('projects')
		.select('id, title, slug, status, created_at, updated_at', { count: 'exact' })
		.eq('status', 'draft')
		.lt('created_at', cutoff)
		.order('created_at', { ascending: true })
		.limit(QUEUE_ITEM_LIMIT)

	if (error) throw error

	return {
		key: 'stale_drafts',
		title: 'Stalled drafts',
		description: `Draft projects with no submission after ${STALE_DRAFT_DAYS} days.`,
		total: count ?? 0,
		error: false,
		viewAllHref: '/admin/projects?status=draft&sort=oldest',
		items: (data ?? []).map((row) =>
			projectQueueItem('stale_drafts', row, {
				hasEscrow: false,
				waitingSince: row.created_at,
				now,
			}),
		),
	}
}

async function getPausedProjectsQueue(
	client: TypedSupabaseClient,
	now: Date,
): Promise<AdminQueueSection> {
	const { data, error, count } = await client
		.from('projects')
		.select('id, title, slug, status, created_at, updated_at', { count: 'exact' })
		.eq('status', 'paused')
		.order('updated_at', { ascending: true })
		.limit(QUEUE_ITEM_LIMIT)

	if (error) throw error

	return {
		key: 'paused_projects',
		title: 'Paused campaigns',
		description: 'Campaigns on hold that need a decision.',
		total: count ?? 0,
		error: false,
		viewAllHref: '/admin/projects?status=paused',
		items: (data ?? []).map((row) =>
			projectQueueItem('paused_projects', row, {
				hasEscrow: true,
				waitingSince: row.updated_at,
				now,
			}),
		),
	}
}

const QUEUE_FALLBACKS: Record<
	AdminQueueKey,
	Omit<AdminQueueSection, 'total' | 'items' | 'error'>
> = {
	project_reviews: {
		key: 'project_reviews',
		title: 'Projects awaiting review',
		description: 'Campaigns submitted for approval, oldest first.',
		viewAllHref: '/admin/projects?status=review',
	},
	missing_escrows: {
		key: 'missing_escrows',
		title: 'Active projects without an escrow',
		description: 'Live campaigns that cannot receive escrowed funds yet.',
		viewAllHref: '/admin/projects?escrow=none&status=active',
	},
	milestone_reviews: {
		key: 'milestone_reviews',
		title: 'Pending milestone reviews',
		description: 'Release review requests waiting for an admin decision.',
		viewAllHref: '/admin/milestone-reviews?status=pending',
	},
	escrow_attention: {
		key: 'escrow_attention',
		title: 'Escrows requiring attention',
		description: 'Disputed contracts and escrows with a broken project association.',
		viewAllHref: '/admin/escrows',
	},
	kyc_cases: {
		key: 'kyc_cases',
		title: 'KYC cases',
		description: 'Verifications pending review or rejected.',
		viewAllHref: '/admin/users?kyc=pending',
	},
	new_users: {
		key: 'new_users',
		title: 'New users',
		description: 'Sign-ups from the last 7 days.',
		viewAllHref: '/admin/users?sort=newest',
	},
	stale_drafts: {
		key: 'stale_drafts',
		title: 'Stalled drafts',
		description: `Draft projects with no submission after ${STALE_DRAFT_DAYS} days.`,
		viewAllHref: '/admin/projects?status=draft&sort=oldest',
	},
	paused_projects: {
		key: 'paused_projects',
		title: 'Paused campaigns',
		description: 'Campaigns on hold that need a decision.',
		viewAllHref: '/admin/projects?status=paused',
	},
}

/**
 * Loads every action queue in parallel. Each queue degrades independently:
 * a failed query yields `{ error: true }` for that queue only, so one broken
 * metric never takes down the whole action center.
 */
export async function getActionQueues(
	client: TypedSupabaseClient,
	now: Date = new Date(),
): Promise<AdminQueueSection[]> {
	const builders: Array<[AdminQueueKey, Promise<AdminQueueSection>]> = [
		['project_reviews', getProjectReviewQueue(client, now)],
		['missing_escrows', getMissingEscrowQueue(client, now)],
		['milestone_reviews', getMilestoneReviewQueue(client, now)],
		['escrow_attention', getEscrowAttentionQueue(client)],
		['kyc_cases', getKycQueue(client, now)],
		['new_users', getNewUsersQueue(client, now)],
		['stale_drafts', getStaleDraftQueue(client, now)],
		['paused_projects', getPausedProjectsQueue(client, now)],
	]

	const settled = await Promise.allSettled(builders.map(([, promise]) => promise))

	return settled.map((result, index) => {
		if (result.status === 'fulfilled') return result.value
		const [key] = builders[index]
		return { ...QUEUE_FALLBACKS[key], total: 0, items: [], error: true }
	})
}
