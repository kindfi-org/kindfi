import { gateway, generateObject } from 'ai'
import { logger } from '@/lib/logger'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import { getEntityTypeLabel } from './field-definitions'
import { buildTranslationSchemaFromFields, pickTranslatableSourceFields } from './schemas'
import type { ContentEntityType, TranslationFields } from './types'

const DEFAULT_TRANSLATION_MODEL = 'openai/gpt-4o-mini'

const LOCALE_LABELS: Record<SupportedLocale, string> = {
	en: 'English',
	es: 'Spanish',
}

const stripHtml = (html: string): string =>
	html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()

function sanitizeSourceFields(fields: TranslationFields): TranslationFields {
	const sanitized = { ...fields } as Record<string, unknown>

	for (const [key, value] of Object.entries(sanitized)) {
		if (typeof value === 'string') {
			sanitized[key] = stripHtml(value)
		} else if (Array.isArray(value)) {
			sanitized[key] = value.map((item) => {
				if (typeof item === 'string') return stripHtml(item)
				if (item && typeof item === 'object') {
					const record = item as Record<string, string>
					return {
						...record,
						title: record.title ? stripHtml(record.title) : record.title,
						description: record.description ? stripHtml(record.description) : record.description,
					}
				}
				return item
			})
		}
	}

	return sanitized as TranslationFields
}

export async function translateEntityFields(
	entityType: ContentEntityType,
	sourceLocale: SupportedLocale,
	targetLocale: SupportedLocale,
	sourceFields: TranslationFields,
): Promise<{ fields: TranslationFields; modelId: string }> {
	const modelId = process.env.AI_TRANSLATION_MODEL ?? DEFAULT_TRANSLATION_MODEL
	const sanitized = sanitizeSourceFields(sourceFields)
	const translatable = pickTranslatableSourceFields(sanitized)
	const schema = buildTranslationSchemaFromFields(translatable)
	const sourceLabel = LOCALE_LABELS[sourceLocale]
	const targetLabel = LOCALE_LABELS[targetLocale]
	const entityLabel = getEntityTypeLabel(entityType)

	const system = `You are a professional translator for KindFi, a social-impact crowdfunding platform.
Translate user-authored ${entityLabel} content from ${sourceLabel} to ${targetLabel}.

Rules:
- Preserve meaning faithfully; improve grammar and clarity in the target language.
- Keep proper nouns, organization names, place names, URLs, numbers, and slugs unchanged.
- Do not add marketing fluff or remove factual details.
- Return only fields present in the source JSON; translate every string value.
- For arrays, preserve the same length and order.
- Return valid JSON matching the schema.`

	const prompt = `Translate this ${entityLabel} content from ${sourceLabel} to ${targetLabel}:

${JSON.stringify(translatable, null, 2)}`

	const { object } = await generateObject({
		model: gateway(modelId),
		schema,
		schemaName: `${entityType}Translation`,
		schemaDescription: `Translated ${entityLabel} fields`,
		system,
		prompt,
		providerOptions: {
			gateway: {
				tags: ['feature:content-translation', `entity:${entityType}`],
			},
		},
	})

	logger.info('Content translation completed', {
		entityType,
		sourceLocale,
		targetLocale,
		modelId,
	})

	return { fields: object as TranslationFields, modelId }
}
