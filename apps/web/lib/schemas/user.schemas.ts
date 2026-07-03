import { z } from 'zod'

export const userSearchQuerySchema = z.object({
	q: z
		.string()
		.min(2, 'Search query must be at least 2 characters')
		.max(100, 'Search query is too long')
		.transform((s) => s.trim()),
})

export type SearchableUser = {
	id: string
	displayName: string | null
	email: string | null
	imageUrl: string | null
	slug: string | null
}
