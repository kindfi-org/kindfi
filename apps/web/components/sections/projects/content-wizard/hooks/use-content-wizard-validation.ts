import { useMemo } from 'react'
import {
	wizardBasicsPrimarySchema,
	wizardBasicsTranslationSchema,
	wizardHighlightsPrimarySchema,
	wizardHighlightsTranslationSchema,
	wizardLanguageSchema,
	wizardLocationSchema,
	wizardMediaSchema,
	wizardStoryPrimarySchema,
	wizardStoryTranslationSchema,
} from '~/lib/schemas/content-wizard.schemas'
import type {
	ContentWizardFormData,
	ContentWizardStep,
} from '~/lib/types/project/content-wizard.types'
import { computeProjectTranslationStatus } from '~/lib/utils/project-translation-status'

export type StepValidation = {
	valid: boolean
	issues: string[]
}

function validateStep(step: ContentWizardStep, formData: ContentWizardFormData): string[] {
	switch (step) {
		case 'language': {
			const result = wizardLanguageSchema.safeParse({ sourceLocale: formData.sourceLocale })
			return result.success ? [] : result.error.issues.map((i) => i.message)
		}
		case 'basics-primary': {
			const result = wizardBasicsPrimarySchema.safeParse({
				title: formData.title,
				description: formData.description,
				targetAmount: formData.targetAmount,
				minimumInvestment: formData.minimumInvestment,
			})
			return result.success ? [] : result.error.issues.map((i) => i.message)
		}
		case 'basics-translation': {
			const result = wizardBasicsTranslationSchema.safeParse({
				translation: formData.translation,
			})
			return result.success ? [] : result.error.issues.map((i) => i.message)
		}
		case 'story-primary': {
			const result = wizardStoryPrimarySchema.safeParse({
				title: formData.pitchTitle,
				story: formData.pitchStory,
			})
			return result.success ? [] : result.error.issues.map((i) => i.message)
		}
		case 'story-translation': {
			const result = wizardStoryTranslationSchema.safeParse({
				pitchTranslation: formData.pitchTranslation,
			})
			return result.success ? [] : result.error.issues.map((i) => i.message)
		}
		case 'highlights-primary': {
			const result = wizardHighlightsPrimarySchema.safeParse({
				highlights: formData.highlights,
			})
			return result.success ? [] : result.error.issues.map((i) => i.message)
		}
		case 'highlights-translation': {
			const result = wizardHighlightsTranslationSchema.safeParse({
				translationHighlights: formData.translationHighlights,
			})
			return result.success ? [] : result.error.issues.map((i) => i.message)
		}
		case 'media': {
			const result = wizardMediaSchema.safeParse({
				image: formData.image,
				website: formData.website ?? '',
				socialLinks: formData.socialLinks,
			})
			return result.success ? [] : result.error.issues.map((i) => i.message)
		}
		case 'location': {
			const result = wizardLocationSchema.safeParse({
				location: formData.location,
				category: formData.category,
				foundationId: formData.foundationId ?? '',
				tags: formData.tags,
			})
			return result.success ? [] : result.error.issues.map((i) => i.message)
		}
		case 'review':
			return []
		default:
			return []
	}
}

export function useContentWizardValidation(formData: ContentWizardFormData) {
	return useMemo(() => {
		const steps = {} as Record<ContentWizardStep, StepValidation>

		for (const step of [
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
		] as ContentWizardStep[]) {
			const issues = validateStep(step, formData)
			steps[step] = { valid: issues.length === 0, issues }
		}

		const translationStatus = computeProjectTranslationStatus({
			title: formData.title,
			description: formData.description,
			targetAmount: formData.targetAmount,
			minimumInvestment: formData.minimumInvestment,
			translation: formData.translation,
			pitchTitle: formData.pitchTitle,
			pitchStory: formData.pitchStory,
			pitchTranslation: formData.pitchTranslation,
			highlights: formData.highlights,
			translationHighlights: formData.translationHighlights,
		})

		return {
			steps,
			translationStatus,
			isFullyValid:
				steps['basics-primary'].valid &&
				steps['basics-translation'].valid &&
				steps['story-primary'].valid &&
				steps['story-translation'].valid &&
				steps['highlights-primary'].valid &&
				steps['highlights-translation'].valid &&
				steps.location.valid,
		}
	}, [formData])
}
