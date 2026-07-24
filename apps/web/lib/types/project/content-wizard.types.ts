import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import type { CreateProjectFormData, ProjectPitchFormData } from './create-project.types'

export interface ContentWizardHighlight {
	id: string
	title: string
	description: string
}

export type ContentWizardStep =
	| 'language'
	| 'basics-primary'
	| 'story-primary'
	| 'highlights-primary'
	| 'basics-translation'
	| 'story-translation'
	| 'highlights-translation'
	| 'media'
	| 'location'
	| 'review'

export const CONTENT_WIZARD_STEPS: ContentWizardStep[] = [
	'language',
	'basics-primary',
	'story-primary',
	'highlights-primary',
	'basics-translation',
	'story-translation',
	'highlights-translation',
	'media',
	'location',
	'review',
]

export type ContentWizardMode = 'create' | 'manage'

export interface ContentWizardFormData extends CreateProjectFormData {
	projectId?: string
	pitchTitle: string
	pitchStory: string
	pitchDeck: string | File | null
	pitchVideoUrl: string | null
	pitchTranslation?: ProjectPitchFormData['translation']
	highlights: ContentWizardHighlight[]
	translationHighlights: ContentWizardHighlight[]
}

export const initialContentWizardFormData = (
	sourceLocale: SupportedLocale = 'en',
): ContentWizardFormData => ({
	title: '',
	description: '',
	targetAmount: 0,
	minimumInvestment: 0,
	image: null,
	website: '',
	socialLinks: [],
	location: '',
	category: '',
	tags: [],
	sourceLocale,
	translation: { title: '', description: '' },
	pitchTitle: '',
	pitchStory: '',
	pitchDeck: null,
	pitchVideoUrl: null,
	pitchTranslation: { title: '', story: '' },
	highlights: [],
	translationHighlights: [],
})

export type TranslationSectionStatus = 'complete' | 'partial' | 'empty'

export interface ProjectTranslationStatus {
	basics: TranslationSectionStatus
	story: TranslationSectionStatus
	highlights: TranslationSectionStatus
	overallPercent: number
}
