import type { NotificationFilters, NotificationSort } from '../types/notification'

/**
 * Normalized, serializable form of every filter that changes the notifications result set.
 * Unset filters are omitted so `{}` and `{ is_read: undefined }` share one cache entry.
 */
export interface NormalizedNotificationFilters {
	is_read?: boolean
	type?: NotificationFilters['type']
	priority?: NotificationFilters['priority']
	created_after?: string
	created_before?: string
}

/**
 * Converts a date filter into a stable cache-key value.
 * Equal instants produce the same ISO string regardless of `Date` identity;
 * invalid dates are dropped, mirroring the query which cannot apply them.
 */
function toStableDate(value: Date | undefined): string | undefined {
	if (!(value instanceof Date)) return undefined
	const time = value.getTime()
	return Number.isNaN(time) ? '__invalid_date__' : new Date(time).toISOString()
}

/**
 * Normalizes notification filters for use in a TanStack Query key.
 * `user_id` is excluded because it is already a dedicated key segment.
 *
 * @param filters - Filters passed to `useNotifications`
 * @returns A plain object containing only result-changing, defined filter values
 */
export function normalizeNotificationFilters(
	filters: NotificationFilters = {},
): NormalizedNotificationFilters {
	const normalized: NormalizedNotificationFilters = {}

	if (typeof filters.is_read === 'boolean') normalized.is_read = filters.is_read
	if (filters.type) normalized.type = filters.type
	if (filters.priority) normalized.priority = filters.priority

	const createdAfter = toStableDate(filters.created_after)
	if (createdAfter) normalized.created_after = createdAfter

	const createdBefore = toStableDate(filters.created_before)
	if (createdBefore) normalized.created_before = createdBefore

	return normalized
}

/**
 * Builds the values appended to `['supabase', 'notifications']` by `useSupabaseQuery`.
 * Keeping `userId` first preserves prefix invalidation per user, and every
 * result-changing input (filters, sort, page, pageSize) gets its own segment.
 *
 * @returns `[userId, filters, sort, page, pageSize]`
 */
export function buildNotificationsKeyValues(
	filters: NotificationFilters,
	sort: NotificationSort,
	page: number,
	pageSize: number,
) {
	return [
		filters.user_id ?? null,
		normalizeNotificationFilters(filters),
		{ field: sort.field, direction: sort.direction },
		page,
		pageSize,
	] as const
}