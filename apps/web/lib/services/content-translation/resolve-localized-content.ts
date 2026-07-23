import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import type { ContentTranslationRow, LocalizeOptions, TranslationFields } from './types'

function isUsableTranslation(
	translation: ContentTranslationRow | null | undefined,
): translation is ContentTranslationRow {
	return (
		translation != null &&
		(translation.status === 'complete' ||
			translation.status === 'pending' ||
			translation.status === 'stale') &&
		Object.keys(translation.fields ?? {}).length > 0
	)
}

export function shouldLocalize(
	sourceLocale: SupportedLocale,
	options?: LocalizeOptions,
): { localize: boolean; viewerLocale: SupportedLocale } {
	const viewerLocale = options?.viewerLocale ?? 'en'
	const localize = options?.localize !== false

	if (!localize || viewerLocale === sourceLocale) {
		return { localize: false, viewerLocale }
	}

	return { localize: true, viewerLocale }
}

export function resolveLocalizedFields<T extends Record<string, unknown>>(
	source: T,
	sourceLocale: SupportedLocale,
	translation: ContentTranslationRow | null | undefined,
	options?: LocalizeOptions,
): T {
	const { localize, viewerLocale } = shouldLocalize(sourceLocale, options)

	if (!localize || viewerLocale === sourceLocale) {
		return source
	}

	if (!isUsableTranslation(translation)) {
		return source
	}

	const translated = translation.fields as TranslationFields
	return { ...source, ...translated } as T
}

export function resolveFoundationFields<
	T extends {
		name: string
		description: string
		story?: string | null
		mission?: string | null
		vision?: string | null
		impactHighlights?: string[]
		impact_highlights?: string[]
	},
>(
	source: T,
	sourceLocale: SupportedLocale,
	translation: ContentTranslationRow | null | undefined,
	options?: LocalizeOptions,
): T {
	const merged = resolveLocalizedFields(source, sourceLocale, translation, options)
	const fields = translation?.fields as
		| {
				impact_highlights?: string[]
		  }
		| undefined

	if (fields?.impact_highlights && shouldLocalize(sourceLocale, options).localize) {
		return {
			...merged,
			impactHighlights: fields.impact_highlights,
			impact_highlights: fields.impact_highlights,
		}
	}

	return merged
}

export function resolveProjectHighlightsMetadata(
	metadata: Record<string, unknown> | null | undefined,
	sourceLocale: SupportedLocale,
	translation: ContentTranslationRow | null | undefined,
	options?: LocalizeOptions,
): Record<string, unknown> {
	const base = metadata ?? {}
	const { localize, viewerLocale } = shouldLocalize(sourceLocale, options)

	if (!localize || viewerLocale === sourceLocale) {
		return base
	}

	const highlights = (
		translation?.fields as { highlights?: Array<{ title: string; description: string }> }
	)?.highlights

	if (!highlights?.length || !isUsableTranslation(translation)) {
		return base
	}

	return {
		...base,
		highlights,
	}
}
