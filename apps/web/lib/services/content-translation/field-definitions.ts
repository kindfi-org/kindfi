import type {
	ContentEntityType,
	FoundationTranslationFields,
	ProjectHighlightFields,
	ProjectPitchTranslationFields,
	ProjectTranslationFields,
} from './types'

export function extractFoundationSourceFields(row: {
	name: string
	description: string
	story: string | null
	mission: string | null
	vision: string | null
	impact_highlights: string[] | null
}): FoundationTranslationFields {
	return {
		name: row.name,
		description: row.description,
		story: row.story,
		mission: row.mission,
		vision: row.vision,
		impact_highlights: row.impact_highlights ?? [],
	}
}

export function extractProjectSourceFields(row: {
	title: string
	description: string | null
	metadata: unknown
}): ProjectTranslationFields {
	const metadata = (row.metadata as Record<string, unknown> | null) ?? {}
	const highlights = metadata.highlights as ProjectHighlightFields[] | undefined

	return {
		title: row.title,
		description: row.description ?? '',
		highlights: highlights ?? [],
	}
}

export function extractProjectPitchSourceFields(row: {
	title: string
	story: string
}): ProjectPitchTranslationFields {
	return {
		title: row.title,
		story: row.story,
	}
}

export function hasTranslatableFoundationContent(fields: FoundationTranslationFields): boolean {
	return Boolean(
		fields.name?.trim() ||
			fields.description?.trim() ||
			fields.story?.trim() ||
			fields.mission?.trim() ||
			fields.vision?.trim() ||
			(fields.impact_highlights?.length ?? 0) > 0,
	)
}

export function hasTranslatableProjectContent(fields: ProjectTranslationFields): boolean {
	return Boolean(
		fields.title?.trim() || fields.description?.trim() || (fields.highlights?.length ?? 0) > 0,
	)
}

export function hasTranslatablePitchContent(fields: ProjectPitchTranslationFields): boolean {
	return Boolean(fields.title?.trim() || fields.story?.trim())
}

export function getEntityTypeLabel(entityType: ContentEntityType): string {
	switch (entityType) {
		case 'foundation':
			return 'foundation profile'
		case 'project':
			return 'campaign'
		case 'project_pitch':
			return 'campaign pitch'
	}
}
