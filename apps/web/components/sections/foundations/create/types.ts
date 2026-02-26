import { z } from 'zod'

export const createFoundationSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters'),
	description: z.string().min(10, 'Description must be at least 10 characters'),
	slug: z
		.string()
		.min(3)
		.regex(
			/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/,
			'Slug must be lowercase alphanumeric with hyphens',
		),
	foundedYear: z
		.number()
		.min(1900)
		.max(new Date().getFullYear(), 'Year cannot be in the future'),
	mission: z.string().optional(),
	vision: z.string().optional(),
	websiteUrl: z.string().url().optional().or(z.literal('')),
	socialLinks: z.record(z.string()).optional(),
	logo: z.instanceof(File).optional().or(z.literal(null)),
})

export type CreateFoundationFormData = z.infer<typeof createFoundationSchema>
