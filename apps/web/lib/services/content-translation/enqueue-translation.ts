import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { logger } from '@/lib/logger'
import { getOppositeLocale, type SupportedLocale } from '~/lib/schemas/locale.schemas'
import {
	extractFoundationSourceFields,
	extractProjectPitchSourceFields,
	extractProjectSourceFields,
	hasTranslatableFoundationContent,
	hasTranslatablePitchContent,
	hasTranslatableProjectContent,
} from './field-definitions'
import { hashSourcePayload } from './hash-source'
import type { ContentEntityType } from './types'

interface SourceContext {
	sourceLocale: SupportedLocale
	sourceFields: ReturnType<
		| typeof extractFoundationSourceFields
		| typeof extractProjectSourceFields
		| typeof extractProjectPitchSourceFields
	>
	sourceHash: string
	targetLocale: SupportedLocale
}

async function loadSourceContext(
	entityType: ContentEntityType,
	entityId: string,
): Promise<SourceContext | null> {
	const supabase = supabaseServiceRole

	if (entityType === 'foundation') {
		const { data, error } = await supabase
			.from('foundations')
			.select('name, description, story, mission, vision, impact_highlights, source_locale')
			.eq('id', entityId)
			.maybeSingle()

		if (error || !data) {
			logger.error('enqueueTranslation: foundation not found', { entityId, error })
			return null
		}

		const sourceLocale = (data.source_locale as SupportedLocale) ?? 'en'
		const sourceFields = extractFoundationSourceFields(data)

		if (!hasTranslatableFoundationContent(sourceFields)) {
			return null
		}

		return {
			sourceLocale,
			sourceFields,
			sourceHash: hashSourcePayload(sourceFields),
			targetLocale: getOppositeLocale(sourceLocale),
		}
	}

	if (entityType === 'project') {
		const { data, error } = await supabase
			.from('projects')
			.select('title, description, metadata, source_locale')
			.eq('id', entityId)
			.maybeSingle()

		if (error || !data) {
			logger.error('enqueueTranslation: project not found', { entityId, error })
			return null
		}

		const sourceLocale = (data.source_locale as SupportedLocale) ?? 'en'
		const sourceFields = extractProjectSourceFields(data)

		if (!hasTranslatableProjectContent(sourceFields)) {
			return null
		}

		return {
			sourceLocale,
			sourceFields,
			sourceHash: hashSourcePayload(sourceFields),
			targetLocale: getOppositeLocale(sourceLocale),
		}
	}

	const { data: pitch, error: pitchError } = await supabase
		.from('project_pitch')
		.select('id, title, story, project_id')
		.eq('id', entityId)
		.maybeSingle()

	if (pitchError || !pitch) {
		logger.error('enqueueTranslation: project pitch not found', { entityId, error: pitchError })
		return null
	}

	const { data: project, error: projectError } = await supabase
		.from('projects')
		.select('source_locale')
		.eq('id', pitch.project_id)
		.maybeSingle()

	if (projectError || !project) {
		logger.error('enqueueTranslation: parent project not found', {
			entityId,
			projectId: pitch.project_id,
			error: projectError,
		})
		return null
	}

	const sourceLocale = (project.source_locale as SupportedLocale) ?? 'en'
	const sourceFields = extractProjectPitchSourceFields(pitch)

	if (!hasTranslatablePitchContent(sourceFields)) {
		return null
	}

	return {
		sourceLocale,
		sourceFields,
		sourceHash: hashSourcePayload(sourceFields),
		targetLocale: getOppositeLocale(sourceLocale),
	}
}

export async function enqueueTranslation(
	entityType: ContentEntityType,
	entityId: string,
): Promise<{ targetLocale: SupportedLocale; sourceHash: string } | null> {
	const context = await loadSourceContext(entityType, entityId)
	if (!context) return null

	const supabase = supabaseServiceRole

	const { data: existing } = await supabase
		.from('content_translations')
		.select('source_hash, status')
		.eq('entity_type', entityType)
		.eq('entity_id', entityId)
		.eq('locale', context.targetLocale)
		.maybeSingle()

	if (
		existing?.source_hash === context.sourceHash &&
		(existing.status === 'complete' || existing.status === 'pending')
	) {
		return null
	}

	const now = new Date().toISOString()
	const { error } = await supabase.from('content_translations').upsert(
		{
			entity_type: entityType,
			entity_id: entityId,
			locale: context.targetLocale,
			fields: {},
			source_locale: context.sourceLocale,
			source_hash: context.sourceHash,
			status: 'pending',
			error_message: null,
			updated_at: now,
		},
		{ onConflict: 'entity_type,entity_id,locale' },
	)

	if (error) {
		logger.error('enqueueTranslation: upsert failed', { entityType, entityId, error })
		throw error
	}

	return { targetLocale: context.targetLocale, sourceHash: context.sourceHash }
}
