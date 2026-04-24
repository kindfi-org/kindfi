import { z } from 'zod'

export const checkSlugQuerySchema = z.object({
	slug: z.string().min(1, 'Slug is required'),
})

export const foundationSlugParamSchema = z.object({
	slug: z.string().min(1, 'Slug is required'),
})

export const foundationCampaignsSchema = z.object({
	projectId: z.string().uuid('Project ID is required'),
	assign: z.boolean(),
})

export const foundationMilestoneCreateSchema = z.object({
	title: z.string().min(1, 'Title is required').transform((s) => s.trim()),
	description: z.string().nullable().optional(),
	achievedDate: z.string().min(1, 'Achieved date is required'),
	impactMetric: z.string().nullable().optional(),
})

export const foundationUpdateFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().min(1, 'Description is required'),
	foundedYear: z
		.number()
		.int()
		.min(1900)
		.max(2100)
		.refine((n) => !Number.isNaN(n), 'Invalid founded year'),
	mission: z.string().nullable().optional(),
	vision: z.string().nullable().optional(),
	websiteUrl: z.string().nullable().optional(),
	socialLinks: z.record(z.string()).optional().default({}),
	logo: z.union([z.instanceof(File), z.null()]).optional(),
})
