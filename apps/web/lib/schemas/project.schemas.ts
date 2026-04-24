import { z } from 'zod'

const tagSchema = z.object({
	name: z.string(),
	color: z.string(),
})

export const projectCreateFormSchema = z
	.object({
		title: z.string().min(3, 'Title must be at least 3 characters'),
		description: z.string().min(10, 'Description must be at least 10 characters'),
		targetAmount: z.number().min(1, 'Target amount must be at least 1'),
		minimumInvestment: z.number().min(1, 'Minimum investment must be at least 1'),
		website: z.string().optional().default(''),
		location: z.string().min(1, 'Location is required'),
		category: z.string().min(1, 'Category is required'),
		tags: z.array(tagSchema).optional().default([]),
		socialLinks: z.array(z.string()).optional().default([]),
		image: z.instanceof(File).nullable().optional(),
		foundationId: z.string().uuid().optional().or(z.literal('')),
	})
	.refine((data) => data.minimumInvestment <= data.targetAmount, {
		message: 'Minimum investment cannot exceed target amount',
		path: ['minimumInvestment'],
	})

export const projectUpdateFormSchema = z
	.object({
		projectId: z.string().uuid('Project ID is required'),
		slug: z.string().min(1).nullable(),
		title: z.string().min(3, 'Title must be at least 3 characters'),
		description: z.string().min(10, 'Description must be at least 10 characters'),
		targetAmount: z.number().min(1, 'Target amount must be at least 1'),
		minimumInvestment: z.number().min(1, 'Minimum investment must be at least 1'),
		website: z.string().optional().default(''),
		location: z.string().min(1, 'Location is required'),
		category: z.string().min(1, 'Category is required'),
		tags: z.array(tagSchema).optional().default([]),
		socialLinks: z.array(z.string()).optional().default([]),
		image: z.instanceof(File).nullable().optional(),
		removeImage: z.boolean().optional(),
	})
	.refine((data) => data.minimumInvestment <= data.targetAmount, {
		message: 'Minimum investment cannot exceed target amount',
		path: ['minimumInvestment'],
	})

export const projectPitchFormSchema = z.object({
	projectId: z.string().uuid('Project ID is required'),
	projectSlug: z.string().min(1, 'Project slug is required'),
	title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
	story: z.string().min(50, 'Story must be at least 50 characters'),
	videoUrl: z.string().nullable().optional(),
	pitchDeck: z.instanceof(File).nullable().optional(),
	removePitchDeck: z.boolean().optional(),
})

export const projectSlugParamSchema = z.object({
	slug: z.string().min(1, 'Slug is required'),
})

export const teamMemberCreateSchema = z.object({
	projectId: z.string().uuid('Project ID is required'),
	fullName: z.string().min(1, 'Full name is required').transform((s) => s.trim()),
	roleTitle: z.string().min(1, 'Role title is required').transform((s) => s.trim()),
	bio: z.string().optional().transform((s) => s?.trim() || undefined),
	photoUrl: z.string().optional().transform((s) => s?.trim() || undefined),
	yearsInvolved: z.number().optional(),
})

export const teamMemberUpdateSchema = z.object({
	projectId: z.string().uuid('Project ID is required'),
	memberId: z.string().uuid('Member ID is required'),
	fullName: z.string().optional(),
	roleTitle: z.string().optional(),
	bio: z.string().optional(),
	photoUrl: z.string().optional(),
	yearsInvolved: z.number().optional().nullable(),
	orderIndex: z.number().optional(),
})

export const teamMemberDeleteQuerySchema = z.object({
	projectId: z.string().uuid('Project ID is required'),
	memberId: z.string().uuid('Member ID is required'),
})

const highlightItemSchema = z.object({
	title: z.string().min(1, 'Title is required').transform((s) => s.trim()),
	description: z.string().min(1, 'Description is required').transform((s) => s.trim()),
})

export const highlightsUpdateSchema = z.object({
	projectId: z.string().uuid('Project ID is required'),
	highlights: z
		.array(highlightItemSchema)
		.min(2, 'At least 2 highlights are required'),
})

export const projectMemberUpdateFormSchema = z
	.object({
		projectId: z.string().uuid('Project ID is required'),
		memberId: z.string().uuid('Member ID is required'),
		role: z
			.union([
				z.enum(['admin', 'editor', 'advisor', 'community', 'core', 'others']),
				z.literal(''),
			])
			.optional()
			.transform((v) => (v === '' ? undefined : v)),
		title: z.string().nullable().optional(),
	})
	.refine((data) => data.role != null || data.title != null, {
		message: 'Provide "role" and/or "title" to update',
		path: ['role'],
	})

export const projectMemberDeleteFormSchema = z.object({
	projectId: z.string().uuid('Project ID is required'),
	memberId: z.string().uuid('Member ID is required'),
})
