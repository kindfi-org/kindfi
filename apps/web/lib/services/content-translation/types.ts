import type { SupportedLocale } from '~/lib/schemas/locale.schemas'

export type ContentEntityType = 'foundation' | 'project' | 'project_pitch'

export type TranslationStatus = 'pending' | 'complete' | 'failed' | 'stale'

export interface ProjectHighlightFields {
	title: string
	description: string
}

export interface FoundationTranslationFields {
	name?: string
	description?: string
	story?: string | null
	mission?: string | null
	vision?: string | null
	impact_highlights?: string[]
}

export interface ProjectTranslationFields {
	title?: string
	description?: string
	highlights?: ProjectHighlightFields[]
}

export interface ProjectPitchTranslationFields {
	title?: string
	story?: string
}

export type TranslationFields =
	| FoundationTranslationFields
	| ProjectTranslationFields
	| ProjectPitchTranslationFields

export interface ContentTranslationRow {
	id: string
	entity_type: ContentEntityType
	entity_id: string
	locale: SupportedLocale
	fields: TranslationFields
	source_locale: SupportedLocale
	source_hash: string
	status: TranslationStatus
	error_message: string | null
	model_id: string | null
	translated_at: string | null
}

export interface LocalizeOptions {
	/** When false, always return source fields (e.g. manage/edit views). Default true. */
	localize?: boolean
	viewerLocale?: SupportedLocale
}
