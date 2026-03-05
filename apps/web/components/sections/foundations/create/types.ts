import { z } from 'zod'

const MAX_NAME_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 5000
const MAX_MISSION_LENGTH = 2000
const MAX_VISION_LENGTH = 2000
const MAX_SOCIAL_LINKS_KEYS = 20

export const createFoundationSchema = z.object({
	name: z
		.string()
		.min(3, 'Name must be at least 3 characters')
		.max(MAX_NAME_LENGTH, `Name must be at most ${MAX_NAME_LENGTH} characters`),
	description: z
		.string()
		.min(10, 'Description must be at least 10 characters')
		.max(
			MAX_DESCRIPTION_LENGTH,
			`Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`,
		),
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
	mission: z.string().max(MAX_MISSION_LENGTH).optional(),
	vision: z.string().max(MAX_VISION_LENGTH).optional(),
	websiteUrl: z.string().url().optional().or(z.literal('')),
	socialLinks: z
		.record(z.string(), z.string().url())
		.refine(
			(obj) => Object.keys(obj).length <= MAX_SOCIAL_LINKS_KEYS,
			`At most ${MAX_SOCIAL_LINKS_KEYS} social links`,
		)
		.optional(),
	logo: z.instanceof(File).optional().or(z.literal(null)),
})

export type CreateFoundationFormData = z.infer<typeof createFoundationSchema>
