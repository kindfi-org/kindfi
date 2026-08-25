import { z } from 'zod'

/**
 * Query-parameter schemas shared by the admin API routes and the admin list
 * UIs. Every field uses `.catch()` so an invalid or hand-edited URL falls
 * back to a safe default instead of failing the request.
 */

export const ADMIN_DEFAULT_PAGE_SIZE = 20
export const ADMIN_MAX_PAGE_SIZE = 50

export const PROJECT_STATUS_FILTERS = [
	'draft',
	'review',
	'active',
	'paused',
	'funded',
	'rejected',
] as const

export const ESCROW_STATE_FILTERS = [
	'NEW',
	'FUNDED',
	'ACTIVE',
	'COMPLETED',
	'DISPUTED',
	'CANCELLED',
] as const

/** Escrow availability filter for project lists: none, any, or a specific state. */
export const PROJECT_ESCROW_FILTERS = ['none', 'any', ...ESCROW_STATE_FILTERS] as const

export const USER_ROLE_FILTERS = [
	'admin',
	'creator',
	'donor',
	'kinder',
	'kindler',
	'pending',
] as const

/** Normalized KYC buckets — `approved` includes the `verified` DB status. */
export const KYC_STATUS_FILTERS = ['not_started', 'pending', 'approved', 'rejected'] as const

export const ONBOARDING_PROVIDER_FILTERS = ['legacy_passkey', 'pollar'] as const

export const WALLET_READINESS_FILTERS = ['pollar', 'external', 'none'] as const

export const PROJECT_SORT_OPTIONS = ['newest', 'oldest', 'funding', 'target', 'status'] as const

export const ESCROW_SORT_OPTIONS = ['newest', 'oldest', 'updated', 'amount'] as const

export const USER_SORT_OPTIONS = ['newest', 'oldest', 'name'] as const

const optionalTrimmedString = z
	.string()
	.trim()
	.max(120)
	.optional()
	.catch(() => undefined)

/** True only for real calendar dates (rejects e.g. 2026-02-30). */
function isValidCalendarDate(value: string): boolean {
	const [year, month, day] = value.split('-').map(Number)
	const date = new Date(Date.UTC(year, month - 1, day))
	return (
		date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
	)
}

const optionalIsoDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/)
	.refine(isValidCalendarDate)
	.optional()
	.catch(() => undefined)

export const adminPaginationSchema = z.object({
	page: z.coerce.number().int().min(1).catch(1),
	pageSize: z.coerce.number().int().min(1).max(ADMIN_MAX_PAGE_SIZE).catch(ADMIN_DEFAULT_PAGE_SIZE),
})

export const adminProjectsQuerySchema = adminPaginationSchema.extend({
	q: optionalTrimmedString,
	status: z
		.enum(PROJECT_STATUS_FILTERS)
		.optional()
		.catch(() => undefined),
	escrow: z
		.enum(PROJECT_ESCROW_FILTERS)
		.optional()
		.catch(() => undefined),
	category: optionalTrimmedString,
	foundation: optionalTrimmedString,
	devOnly: z
		.enum(['true', 'false'])
		.optional()
		.catch(() => undefined),
	from: optionalIsoDate,
	to: optionalIsoDate,
	sort: z.enum(PROJECT_SORT_OPTIONS).catch('newest'),
})

export const adminEscrowsQuerySchema = adminPaginationSchema.extend({
	q: optionalTrimmedString,
	state: z
		.enum(ESCROW_STATE_FILTERS)
		.optional()
		.catch(() => undefined),
	project: optionalTrimmedString,
	sort: z.enum(ESCROW_SORT_OPTIONS).catch('newest'),
})

export const adminUsersQuerySchema = adminPaginationSchema.extend({
	q: optionalTrimmedString,
	role: z
		.enum(USER_ROLE_FILTERS)
		.optional()
		.catch(() => undefined),
	kyc: z
		.enum(KYC_STATUS_FILTERS)
		.optional()
		.catch(() => undefined),
	provider: z
		.enum(ONBOARDING_PROVIDER_FILTERS)
		.optional()
		.catch(() => undefined),
	wallet: z
		.enum(WALLET_READINESS_FILTERS)
		.optional()
		.catch(() => undefined),
	from: optionalIsoDate,
	to: optionalIsoDate,
	sort: z.enum(USER_SORT_OPTIONS).catch('newest'),
})

export const adminActionQueueQuerySchema = z.object({
	countsOnly: z
		.enum(['true', 'false'])
		.optional()
		.catch(() => undefined),
})

export type AdminProjectsQuery = z.infer<typeof adminProjectsQuerySchema>
export type AdminEscrowsQuery = z.infer<typeof adminEscrowsQuerySchema>
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>
export type AdminActionQueueQuery = z.infer<typeof adminActionQueueQuerySchema>

export interface AdminListResponse<T> {
	items: T[]
	total: number
	page: number
	pageSize: number
}

/**
 * Parses raw search params (from a URL or a Next.js request) with the given
 * schema. Unknown keys are ignored; invalid values fall back to defaults.
 */
export function parseAdminListParams<Schema extends z.ZodType>(
	schema: Schema,
	searchParams: URLSearchParams,
): z.infer<Schema> {
	const raw: Record<string, string> = {}
	for (const [key, value] of searchParams.entries()) {
		if (!(key in raw)) raw[key] = value
	}
	return schema.parse(raw)
}

/**
 * Produces a stable, serializable representation of parsed params for use in
 * TanStack Query keys. Keys are sorted and `undefined` values dropped so the
 * server prefetch and the client hook always derive the identical key.
 */
export function normalizeAdminListParams(params: Record<string, unknown>): Record<string, string> {
	const normalized: Record<string, string> = {}
	for (const key of Object.keys(params).sort()) {
		const value = params[key]
		if (value === undefined || value === null || value === '') continue
		normalized[key] = String(value)
	}
	return normalized
}

/**
 * Serializes parsed params into a query string for `/api/admin/*` requests.
 */
export function buildAdminListQueryString(params: Record<string, unknown>): string {
	const normalized = normalizeAdminListParams(params)
	const search = new URLSearchParams(normalized)
	return search.toString()
}

/**
 * TanStack Query key for an admin surface. Shared by the client hooks and
 * server prefetching so hydration always matches.
 */
export function adminQueryKey(
	surface: string,
	params?: Record<string, unknown>,
): [string, string, Record<string, string>] | [string, string] {
	if (!params) return ['admin', surface]
	return ['admin', surface, normalizeAdminListParams(params)]
}
