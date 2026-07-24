import 'server-only'

import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { logger } from '@/lib/logger'
import { getOppositeLocale, type SupportedLocale } from '~/lib/schemas/locale.schemas'
import { extractProjectPitchSourceFields, extractProjectSourceFields } from './field-definitions'
import { hashSourcePayload } from './hash-source'
import type { ContentEntityType, TranslationFields } from './types'

async function loadProjectSourceHash(entityId: string): Promise<string | null> {
	const { data, error } = await supabaseServiceRole
		.from('projects')
		.select('title, description, metadata')
		.eq('id', entityId)
		.maybeSingle()

	if (error || !data) {
		logger.error('upsertManualTranslation: project not found', { entityId, error })
		return null
	}

	return hashSourcePayload(extractProjectSourceFields(data))
}

async function loadPitchSourceHash(entityId: string): Promise<string | null> {
	const { data, error } = await supabaseServiceRole
		.from('project_pitch')
		.select('title, story')
		.eq('id', entityId)
		.maybeSingle()

	if (error || !data) {
		logger.error('upsertManualTranslation: project pitch not found', { entityId, error })
		return null
	}

	return hashSourcePayload(extractProjectPitchSourceFields(data))
}

async function loadSourceHash(
	entityType: ContentEntityType,
	entityId: string,
): Promise<string | null> {
	if (entityType === 'project') {
		return loadProjectSourceHash(entityId)
	}

	if (entityType === 'project_pitch') {
		return loadPitchSourceHash(entityId)
	}

	return null
}

function hasTranslationContent(fields: TranslationFields): boolean {
	return Object.values(fields).some((value) => {
		if (Array.isArray(value)) {
			return value.length > 0
		}

		if (typeof value === 'string') {
			return value.trim().length > 0
		}

		return value != null
	})
}

export async function upsertManualTranslation(
	entityType: ContentEntityType,
	entityId: string,
	sourceLocale: SupportedLocale,
	partialFields: Partial<TranslationFields>,
): Promise<void> {
	if (entityType === 'foundation') {
		return
	}

	const targetLocale = getOppositeLocale(sourceLocale)
	const supabase = supabaseServiceRole

	const { data: existing, error: existingError } = await supabase
		.from('content_translations')
		.select('fields')
		.eq('entity_type', entityType)
		.eq('entity_id', entityId)
		.eq('locale', targetLocale)
		.maybeSingle()

	if (existingError) {
		logger.error('upsertManualTranslation: failed to load existing translation', {
			entityType,
			entityId,
			error: existingError,
		})
		throw existingError
	}

	const mergedFields = {
		...((existing?.fields as TranslationFields | undefined) ?? {}),
		...partialFields,
	} as TranslationFields

	if (!hasTranslationContent(mergedFields)) {
		return
	}

	const sourceHash = (await loadSourceHash(entityType, entityId)) ?? ''
	const now = new Date().toISOString()

	const { error } = await supabase.from('content_translations').upsert(
		{
			entity_type: entityType,
			entity_id: entityId,
			locale: targetLocale,
			fields: mergedFields,
			source_locale: sourceLocale,
			source_hash: sourceHash,
			status: 'complete',
			error_message: null,
			model_id: null,
			translated_at: now,
			updated_at: now,
		},
		{ onConflict: 'entity_type,entity_id,locale' },
	)

	if (error) {
		logger.error('upsertManualTranslation: upsert failed', { entityType, entityId, error })
		throw error
	}
}
