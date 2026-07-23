import { z } from 'zod'
import { sourceLocaleSchema } from './locale.schemas'

const MAX_IMPACT_HIGHLIGHTS = 12
const MAX_IMPACT_ITEM_LENGTH = 300

const impactHighlightSchema = z.string().max(MAX_IMPACT_ITEM_LENGTH)

const impactHighlightsField = z.preprocess((val) => {
	if (!Array.isArray(val)) return []
	return val.map((item) => String(item).trim()).filter(Boolean)
}, z.array(impactHighlightSchema).max(MAX_IMPACT_HIGHLIGHTS).optional().default([]))

export const createFoundationFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().min(1, 'Description is required'),
	story: z.string().nullable().optional(),
	impactHighlights: impactHighlightsField,
	slug: z
		.string()
		.min(1, 'Slug is required')
		.regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
	foundedYear: z.coerce.number().int().min(1900, 'Invalid year').max(2100),
	mission: z.string().nullable().optional(),
	vision: z.string().nullable().optional(),
	websiteUrl: z.string().url().nullable().optional().or(z.literal('')),
	socialLinks: z.record(z.string(), z.string()).optional().default({}),
	sourceLocale: sourceLocaleSchema.optional().default('en'),
})
