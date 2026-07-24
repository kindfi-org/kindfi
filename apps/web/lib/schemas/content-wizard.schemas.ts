import { z } from 'zod'
import {
	projectPitchSchema,
	stepOneSchema,
	stepThreeSchema,
	stepTwoSchema,
} from './create-project.schemas'
import { sourceLocaleSchema } from './locale.schemas'

export const wizardLanguageSchema = z.object({
	sourceLocale: sourceLocaleSchema,
})

export const wizardBasicsPrimarySchema = stepOneSchema

export const wizardBasicsTranslationSchema = z.object({
	translation: z.object({
		title: z.string().min(3, 'Title must be at least 3 characters'),
		description: z.string().min(10, 'Description must be at least 10 characters'),
	}),
})

export const wizardStoryPrimarySchema = projectPitchSchema.pick({ title: true, story: true })

export const wizardStoryTranslationSchema = z.object({
	pitchTranslation: z.object({
		title: z
			.string()
			.min(1, 'Title is required')
			.max(100, 'Title must be less than 100 characters'),
		story: z
			.string()
			.trim()
			.refine(
				(val) => {
					const plainText = val.replace(/<[^>]*>/g, '').trim()
					return plainText.length >= 50
				},
				{ message: 'Story must be at least 50 characters long' },
			),
	}),
})

const highlightItemSchema = z.object({
	id: z.string(),
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
})

export const wizardHighlightsPrimarySchema = z.object({
	highlights: z.array(highlightItemSchema).min(2, 'At least 2 highlights are required'),
})

export const wizardHighlightsTranslationSchema = z.object({
	translationHighlights: z.array(highlightItemSchema).min(2, 'At least 2 highlights are required'),
})

export const wizardMediaSchema = stepTwoSchema

export const wizardLocationSchema = stepThreeSchema
