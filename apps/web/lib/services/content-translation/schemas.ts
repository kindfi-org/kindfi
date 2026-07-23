import { z } from 'zod'
import type { TranslationFields } from './types'

const projectHighlightTranslationSchema = z.object({
	title: z.string(),
	description: z.string(),
})

function hasTranslatableValue(value: unknown): boolean {
	if (value === null || value === undefined) return false
	if (typeof value === 'string') return value.trim().length > 0
	if (Array.isArray(value)) return value.length > 0
	return false
}

/** Keep only fields that will be sent to the model (non-empty strings / non-empty arrays). */
export function pickTranslatableSourceFields(fields: TranslationFields): TranslationFields {
	const picked: Record<string, unknown> = {}

	for (const [key, value] of Object.entries(fields)) {
		if (hasTranslatableValue(value)) {
			picked[key] = value
		}
	}

	return picked as TranslationFields
}

/**
 * Build a Zod schema for OpenAI structured output.
 * OpenAI requires every property to appear in `required` — optional fields are rejected.
 * We therefore include only keys present in the source payload, all as required types.
 */
export function buildTranslationSchemaFromFields(
	fields: TranslationFields,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
	const shape: Record<string, z.ZodTypeAny> = {}

	for (const [key, value] of Object.entries(fields)) {
		if (!hasTranslatableValue(value)) continue

		if (key === 'impact_highlights' && Array.isArray(value)) {
			shape[key] = z.array(z.string())
		} else if (key === 'highlights' && Array.isArray(value)) {
			shape[key] = z.array(projectHighlightTranslationSchema)
		} else if (typeof value === 'string') {
			shape[key] = z.string()
		}
	}

	if (Object.keys(shape).length === 0) {
		throw new Error('No translatable fields in source payload')
	}

	return z.object(shape)
}
