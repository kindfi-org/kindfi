import type { TypedSupabaseClient } from '@packages/lib/types'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import {
	fetchContentTranslation,
	fetchOppositeLocaleTranslation,
	type LocalizeOptions,
	resolveLocalizedFields,
} from '~/lib/services/content-translation'
import type { ProjectPitchTranslationContent } from '~/lib/services/content-translation/types'

export type GetProjectPitchOptions = LocalizeOptions & {
	viewerLocale?: SupportedLocale
}

export async function getProjectPitch(
	client: TypedSupabaseClient,
	projectId: string,
	options?: GetProjectPitchOptions,
) {
	const { data, error } = await client
		.from('project_pitch')
		.select('id, title, story, pitch_deck, video_url, project_id')
		.eq('project_id', projectId)
		.single()

	if (error && error.code !== 'PGRST116') throw error

	if (!data) {
		return {
			id: null,
			title: '',
			story: '',
			pitchDeck: null,
			videoUrl: null,
			translation: undefined,
		}
	}

	const { data: project } = await client
		.from('projects')
		.select('source_locale')
		.eq('id', projectId)
		.maybeSingle()

	const sourceLocale = (project?.source_locale as SupportedLocale | undefined) ?? 'en'

	const pitchTranslation =
		options?.localize !== false
			? await fetchContentTranslation(
					client,
					'project_pitch',
					data.id,
					options?.viewerLocale ?? 'en',
				)
			: null

	const localized = resolveLocalizedFields(
		{
			title: data.title,
			story: data.story,
		},
		sourceLocale,
		pitchTranslation,
		options,
	)

	let translation: ProjectPitchTranslationContent | undefined
	if (options?.localize === false) {
		const oppositeTranslation = await fetchOppositeLocaleTranslation(
			client,
			'project_pitch',
			data.id,
			sourceLocale,
		)
		const fields = oppositeTranslation?.fields as ProjectPitchTranslationContent | undefined
		translation = {
			title: fields?.title ?? '',
			story: fields?.story ?? '',
		}
	}

	return {
		id: data.id,
		title: localized.title ?? data.title,
		story: localized.story ?? data.story,
		pitchDeck: data.pitch_deck,
		videoUrl: data.video_url,
		translation,
	}
}
