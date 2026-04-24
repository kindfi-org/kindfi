import { z } from 'zod'

export const createFoundationFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().min(1, 'Description is required'),
	slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
	foundedYear: z.coerce.number().int().min(1900, 'Invalid year').max(2100),
	mission: z.string().nullable().optional(),
	vision: z.string().nullable().optional(),
	websiteUrl: z.string().url().nullable().optional().or(z.literal('')),
	socialLinks: z.record(z.string()).optional().default({}),
})
