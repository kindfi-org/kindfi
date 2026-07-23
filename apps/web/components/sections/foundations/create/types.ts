import { z } from 'zod'
import { sourceLocaleSchema } from '~/lib/schemas/locale.schemas'

const MAX_NAME_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 2000
const MAX_STORY_LENGTH = 5000
const MAX_MISSION_LENGTH = 2000
const MAX_VISION_LENGTH = 2000
const MAX_IMPACT_HIGHLIGHTS = 12
const MAX_IMPACT_ITEM_LENGTH = 300
const MAX_SOCIAL_LINKS_KEYS = 20

const impactHighlightSchema = z
	.string()
	.max(
		MAX_IMPACT_ITEM_LENGTH,
		`Each highlight must be at most ${MAX_IMPACT_ITEM_LENGTH} characters`,
	)

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
	story: z
		.string()
		.max(MAX_STORY_LENGTH, `Story must be at most ${MAX_STORY_LENGTH} characters`)
		.optional()
		.or(z.literal('')),
	impactHighlights: z.preprocess(
		(val) => {
			if (!Array.isArray(val)) return []
			return val.map((item) => String(item).trim()).filter(Boolean)
		},
		z
			.array(impactHighlightSchema)
			.max(MAX_IMPACT_HIGHLIGHTS, `At most ${MAX_IMPACT_HIGHLIGHTS} impact highlights`)
			.optional()
			.default([]),
	),
	slug: z
		.string()
		.min(3)
		.regex(
			/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/,
			'Slug must be lowercase alphanumeric with hyphens',
		),
	foundedYear: z.number().min(1900).max(new Date().getFullYear(), 'Year cannot be in the future'),
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
	sourceLocale: sourceLocaleSchema.optional().default('en'),
})

export type CreateFoundationFormData = z.infer<typeof createFoundationSchema>
