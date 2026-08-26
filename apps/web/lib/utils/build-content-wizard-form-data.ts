import {
	type ContentWizardFormData,
	type ContentWizardHighlight,
	initialContentWizardFormData,
} from '~/lib/types/project/content-wizard.types'
import type {
	BasicProjectInfo,
	ProjectPitchFormData,
} from '~/lib/types/project/create-project.types'
import { generateUniqueId } from '~/lib/utils/id'
import { normalizeProjectToFormDefaults } from '~/lib/utils/project-utils'

type HighlightsData = {
	projectId: string
	sourceLocale: 'en' | 'es'
	highlights: ContentWizardHighlight[]
	translationHighlights: ContentWizardHighlight[]
}

export function buildContentWizardFormData(input: {
	project: BasicProjectInfo
	pitch?: (ProjectPitchFormData & { translation?: ProjectPitchFormData['translation'] }) | null
	highlights?: HighlightsData | null
}): ContentWizardFormData {
	const base = normalizeProjectToFormDefaults(input.project)
	const sourceLocale = input.project.sourceLocale ?? 'en'

	const highlights =
		input.highlights?.highlights?.length && input.highlights.highlights.length >= 2
			? input.highlights.highlights
			: [
					{ id: generateUniqueId('highlight-'), title: '', description: '' },
					{ id: generateUniqueId('highlight-'), title: '', description: '' },
				]

	const translationHighlights =
		input.highlights?.translationHighlights?.length &&
		input.highlights.translationHighlights.length >= 2
			? input.highlights.translationHighlights
			: highlights.map(() => ({
					id: generateUniqueId('translation-highlight-'),
					title: '',
					description: '',
				}))

	return {
		...initialContentWizardFormData(sourceLocale),
		...base,
		projectId: input.project.id,
		slug: input.project.slug ?? undefined,
		pitchTitle: input.pitch?.title ?? '',
		pitchStory: input.pitch?.story ?? '',
		pitchDeck: input.pitch?.pitchDeck ?? null,
		pitchVideoUrl: input.pitch?.videoUrl ?? null,
		pitchTranslation: {
			title: input.pitch?.translation?.title ?? '',
			story: input.pitch?.translation?.story ?? '',
		},
		highlights,
		translationHighlights,
		foundationId: input.project.foundation?.id,
	}
}
