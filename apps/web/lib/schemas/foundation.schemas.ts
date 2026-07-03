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
	title: z
		.string()
		.min(1, 'Title is required')
		.transform((s) => s.trim()),
	description: z.string().nullable().optional(),
	achievedDate: z.string().min(1, 'Achieved date is required'),
	impactMetric: z.string().nullable().optional(),
})

const foundationTeamRoleTitleSchema = z
	.string()
	.min(1, 'Role title is required')
	.transform((s) => s.trim())

const foundationTeamBioSchema = z
	.string()
	.optional()
	.transform((s) => s?.trim() || undefined)

export const foundationTeamMemberCreateSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('manual'),
		foundationId: z.string().uuid('Foundation ID is required'),
		fullName: z
			.string()
			.min(1, 'Full name is required')
			.transform((s) => s.trim()),
		roleTitle: foundationTeamRoleTitleSchema,
		bio: foundationTeamBioSchema,
		photoUrl: z
			.string()
			.optional()
			.transform((s) => s?.trim() || undefined),
		yearsInvolved: z.number().optional(),
	}),
	z.object({
		type: z.literal('registered'),
		foundationId: z.string().uuid('Foundation ID is required'),
		userId: z.string().uuid('User ID is required'),
		roleTitle: foundationTeamRoleTitleSchema,
		bio: foundationTeamBioSchema,
	}),
])

export const foundationTeamMemberDeleteQuerySchema = z.object({
	foundationId: z.string().uuid('Foundation ID is required'),
	memberId: z.string().uuid('Member ID is required'),
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
	socialLinks: z.record(z.string(), z.string()).optional().default({}),
	logo: z.union([z.instanceof(File), z.null()]).optional(),
})
