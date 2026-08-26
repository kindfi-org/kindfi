import { z } from 'zod'

/** URLSearchParams.get() returns null for missing keys; coerce treats null as 0. */
const emptyQueryParamToUndefined = (value: unknown) =>
	value === null || value === '' ? undefined : value

/** Reusable query params schema for paginated endpoints */
export const paginationQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

/** Alternative pagination with limit/offset (used by comments) */
export const limitOffsetQuerySchema = z.object({
	limit: z.preprocess(
		emptyQueryParamToUndefined,
		z.coerce.number().int().min(1).max(100).default(50),
	),
	offset: z.preprocess(emptyQueryParamToUndefined, z.coerce.number().int().min(0).default(0)),
})
