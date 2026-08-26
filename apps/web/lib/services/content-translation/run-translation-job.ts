import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { logger } from '@/lib/logger'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import {
	extractFoundationSourceFields,
	extractProjectPitchSourceFields,
	extractProjectSourceFields,
	hasTranslatableFoundationContent,
	hasTranslatablePitchContent,
	hasTranslatableProjectContent,
} from './field-definitions'
import { hashSourcePayload } from './hash-source'
import { translateEntityFields } from './translate-entity'
import type { ContentEntityType, TranslationFields } from './types'

export async function runTranslationJob(
	entityType: ContentEntityType,
	entityId: string,
	targetLocale: SupportedLocale,
): Promise<void> {
	const supabase = supabaseServiceRole
	const startedAt = Date.now()

	try {
		let sourceLocale: SupportedLocale = 'en'
		let sourceFields: TranslationFields
		let sourceHash = ''

		if (entityType === 'foundation') {
			const { data, error } = await supabase
				.from('foundations')
				.select('name, description, story, mission, vision, impact_highlights, source_locale')
				.eq('id', entityId)
				.maybeSingle()

			if (error || !data) throw new Error('Foundation not found for translation')

			sourceLocale = (data.source_locale as SupportedLocale) ?? 'en'
			const fields = extractFoundationSourceFields(data)
			sourceFields = fields
			sourceHash = hashSourcePayload(fields)

			if (!hasTranslatableFoundationContent(fields)) return
		} else if (entityType === 'project') {
			const { data, error } = await supabase
				.from('projects')
				.select('title, description, metadata, source_locale')
				.eq('id', entityId)
				.maybeSingle()

			if (error || !data) throw new Error('Project not found for translation')

			sourceLocale = (data.source_locale as SupportedLocale) ?? 'en'
			const fields = extractProjectSourceFields(data)
			sourceFields = fields
			sourceHash = hashSourcePayload(fields)

			if (!hasTranslatableProjectContent(fields)) return
		} else {
			const { data: pitch, error: pitchError } = await supabase
				.from('project_pitch')
				.select('id, title, story, project_id')
				.eq('id', entityId)
				.maybeSingle()

			if (pitchError || !pitch) throw new Error('Project pitch not found for translation')

			const { data: project, error: projectError } = await supabase
				.from('projects')
				.select('source_locale')
				.eq('id', pitch.project_id)
				.maybeSingle()

			if (projectError || !project)
				throw new Error('Parent project not found for pitch translation')

			sourceLocale = (project.source_locale as SupportedLocale) ?? 'en'
			const fields = extractProjectPitchSourceFields(pitch)
			sourceFields = fields
			sourceHash = hashSourcePayload(fields)

			if (!hasTranslatablePitchContent(fields)) return
		}

		if (targetLocale === sourceLocale) return

		const { fields, modelId } = await translateEntityFields(
			entityType,
			sourceLocale,
			targetLocale,
			sourceFields,
		)

		const now = new Date().toISOString()
		const { error: updateError } = await supabase
			.from('content_translations')
			.update({
				fields,
				source_locale: sourceLocale,
				source_hash: sourceHash,
				status: 'complete',
				error_message: null,
				model_id: modelId,
				translated_at: now,
				updated_at: now,
			})
			.eq('entity_type', entityType)
			.eq('entity_id', entityId)
			.eq('locale', targetLocale)

		if (updateError) throw updateError

		logger.info('Translation job saved', {
			entityType,
			entityId,
			targetLocale,
			durationMs: Date.now() - startedAt,
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown translation error'
		logger.error('Translation job failed', { entityType, entityId, targetLocale, error })

		await supabase
			.from('content_translations')
			.update({
				status: 'failed',
				error_message: message,
				updated_at: new Date().toISOString(),
			})
			.eq('entity_type', entityType)
			.eq('entity_id', entityId)
			.eq('locale', targetLocale)
	}
}
