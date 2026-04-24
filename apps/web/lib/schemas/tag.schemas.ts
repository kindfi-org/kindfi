import { z } from 'zod'
import { paginationQuerySchema } from './common.schemas'

export { paginationQuerySchema }
export const createTagSchema = z.object({
	name: z
		.string()
		.min(1, 'Tag name is required')
		.max(50, 'Tag name must be 50 characters or less')
		.transform((s) => s.trim()),
	color: z.string().optional(),
})

export const updateTagSchema = z.object({
	name: z
		.string()
		.min(1, 'Tag name is required')
		.max(50, 'Tag name must be 50 characters or less')
		.regex(
			/^[a-zA-Z0-9\s-_]+$/,
			'Tag name contains invalid characters',
		)
		.transform((s) => s.trim()),
})

export const tagIdParamSchema = z.object({
	tagId: z.string().min(1, 'Tag ID is required'),
})
