import { projectPitchSchema, stepOneSchema } from '~/lib/schemas/create-project.schemas'
import type {
	ProjectPitchTranslationContent,
	ProjectTranslationContent,
} from '~/lib/services/content-translation/types'
import type {
	ContentWizardHighlight,
	ProjectTranslationStatus,
	TranslationSectionStatus,
} from '~/lib/types/project/content-wizard.types'

const MIN_HIGHLIGHTS = 2

function sectionStatus(
	sourceComplete: boolean,
	translationComplete: boolean,
): TranslationSectionStatus {
	if (sourceComplete && translationComplete) return 'complete'
	if (sourceComplete || translationComplete) return 'partial'
	return 'empty'
}

function isBasicsSourceComplete(data: {
	title: string
	description: string
	targetAmount: number
	minimumInvestment: number
}): boolean {
	return stepOneSchema.safeParse({
		title: data.title,
		description: data.description,
		targetAmount: data.targetAmount,
		minimumInvestment: data.minimumInvestment,
	}).success
}

function isBasicsTranslationComplete(translation?: ProjectTranslationContent): boolean {
	const title = translation?.title?.trim() ?? ''
	const description = translation?.description?.trim() ?? ''
	return title.length >= 3 && description.length >= 10
}

function isStorySourceComplete(data: { pitchTitle: string; pitchStory: string }): boolean {
	return projectPitchSchema.safeParse({
		title: data.pitchTitle,
		story: data.pitchStory,
		pitchDeck: null,
		videoUrl: null,
	}).success
}

function isStoryTranslationComplete(translation?: ProjectPitchTranslationContent): boolean {
	const title = translation?.title?.trim() ?? ''
	const story = translation?.story?.trim() ?? ''
	const plainStory = story.replace(/<[^>]*>/g, '').trim()
	return title.length >= 1 && plainStory.length >= 50
}

function isHighlightsListComplete(highlights: ContentWizardHighlight[]): boolean {
	if (highlights.length < MIN_HIGHLIGHTS) return false
	return highlights.every((h) => h.title.trim().length > 0 && h.description.trim().length > 0)
}

export function computeProjectTranslationStatus(input: {
	title: string
	description: string
	targetAmount: number
	minimumInvestment: number
	translation?: ProjectTranslationContent
	pitchTitle: string
	pitchStory: string
	pitchTranslation?: ProjectPitchTranslationContent
	highlights: ContentWizardHighlight[]
	translationHighlights: ContentWizardHighlight[]
}): ProjectTranslationStatus {
	const basicsSource = isBasicsSourceComplete(input)
	const basicsTranslation = isBasicsTranslationComplete(input.translation)
	const storySource = isStorySourceComplete(input)
	const storyTranslation = isStoryTranslationComplete(input.pitchTranslation)
	const highlightsSource = isHighlightsListComplete(input.highlights)
	const highlightsTranslation = isHighlightsListComplete(input.translationHighlights)

	const basics = sectionStatus(basicsSource, basicsTranslation)
	const story = sectionStatus(storySource, storyTranslation)
	const highlights = sectionStatus(highlightsSource, highlightsTranslation)

	const sections = [basics, story, highlights]
	const completeCount = sections.filter((s) => s === 'complete').length
	const partialWeight = sections.filter((s) => s === 'partial').length * 0.5
	const overallPercent = Math.round(((completeCount + partialWeight) / sections.length) * 100)

	return { basics, story, highlights, overallPercent }
}

export function getFirstIncompleteWizardStep(input: {
	title: string
	description: string
	targetAmount: number
	minimumInvestment: number
	translation?: ProjectTranslationContent
	pitchTitle: string
	pitchStory: string
	pitchTranslation?: ProjectPitchTranslationContent
	highlights: ContentWizardHighlight[]
	translationHighlights: ContentWizardHighlight[]
	hasSourceLocale: boolean
}): import('~/lib/types/project/content-wizard.types').ContentWizardStep {
	if (!input.hasSourceLocale) return 'language'
	if (!isBasicsSourceComplete(input)) return 'basics-primary'
	if (!isBasicsTranslationComplete(input.translation)) return 'basics-translation'
	if (!isStorySourceComplete(input)) return 'story-primary'
	if (!isStoryTranslationComplete(input.pitchTranslation)) return 'story-translation'
	if (!isHighlightsListComplete(input.highlights)) return 'highlights-primary'
	if (!isHighlightsListComplete(input.translationHighlights)) return 'highlights-translation'
	return 'media'
}
