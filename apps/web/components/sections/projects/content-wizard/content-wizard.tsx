'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { ContentWizardStepIndicator } from '~/components/sections/projects/content-wizard/content-wizard-step-indicator'
import { useContentWizardSave } from '~/components/sections/projects/content-wizard/hooks/use-content-wizard-save'
import { useContentWizardValidation } from '~/components/sections/projects/content-wizard/hooks/use-content-wizard-validation'
import { WizardBasicsPrimaryStep } from '~/components/sections/projects/content-wizard/steps/wizard-basics-primary-step'
import { WizardBasicsTranslationStep } from '~/components/sections/projects/content-wizard/steps/wizard-basics-translation-step'
import { WizardHighlightsStep } from '~/components/sections/projects/content-wizard/steps/wizard-highlights-step'
import { WizardLanguageStep } from '~/components/sections/projects/content-wizard/steps/wizard-language-step'
import { WizardLocationStep } from '~/components/sections/projects/content-wizard/steps/wizard-location-step'
import { WizardMediaStep } from '~/components/sections/projects/content-wizard/steps/wizard-media-step'
import { WizardReviewStep } from '~/components/sections/projects/content-wizard/steps/wizard-review-step'
import { WizardStoryPrimaryStep } from '~/components/sections/projects/content-wizard/steps/wizard-story-primary-step'
import { WizardStoryTranslationStep } from '~/components/sections/projects/content-wizard/steps/wizard-story-translation-step'
import { ManageSectionHeader } from '~/components/sections/projects/manage/manage-section-header'
import { useContentWizard } from '~/hooks/contexts/use-content-wizard.context'
import { useI18n } from '~/lib/i18n/context'
import { getAllCategories } from '~/lib/queries/projects'
import type { ContentWizardStep } from '~/lib/types/project/content-wizard.types'
import { getFirstIncompleteWizardStep } from '~/lib/utils/project-translation-status'

const isContentWizardStep = (value: string | null): value is ContentWizardStep => {
	if (!value) return false
	return [
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
	].includes(value)
}

export function ContentWizard() {
	const { t } = useI18n()
	const router = useRouter()
	const searchParams = useSearchParams()
	const {
		mode,
		formData,
		updateFormData,
		currentStep,
		setCurrentStep,
		goToNextStep,
		goToPreviousStep,
		lockSourceLocale,
		projectSlug,
	} = useContentWizard()

	const { data: categories = [] } = useSupabaseQuery('categories', getAllCategories, {
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60,
	})

	const { steps, translationStatus } = useContentWizardValidation(formData)
	const { saveStep, isSaving } = useContentWizardSave()

	const hasInitializedStep = useRef(false)

	useEffect(() => {
		const stepParam = searchParams.get('step')
		if (isContentWizardStep(stepParam) && stepParam !== currentStep) {
			setCurrentStep(stepParam)
			hasInitializedStep.current = true
		}
	}, [searchParams, currentStep, setCurrentStep])

	useEffect(() => {
		if (mode === 'manage' && !hasInitializedStep.current && !searchParams.get('step')) {
			const resumeStep = getFirstIncompleteWizardStep({
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
				hasSourceLocale: Boolean(formData.sourceLocale),
			})
			setCurrentStep(resumeStep)
			hasInitializedStep.current = true
		}
	}, [mode, formData, searchParams, setCurrentStep])

	const defaultCategoryId = categories[0]?.id ?? ''

	const persistAndAdvance = useCallback(
		async (partial: Partial<typeof formData>, step: ContentWizardStep) => {
			const merged = { ...formData, ...partial }
			updateFormData(partial)
			await saveStep(step, merged)
			goToNextStep()
		},
		[formData, updateFormData, saveStep, goToNextStep],
	)

	const handleLanguageContinue = useCallback(() => {
		lockSourceLocale()
		goToNextStep()
	}, [lockSourceLocale, goToNextStep])

	const handleBasicsPrimaryContinue = useCallback(
		async (data: {
			title: string
			description: string
			targetAmount: number
			minimumInvestment: number
		}) => {
			const partial = {
				...data,
				location: formData.location || 'USA',
				category: formData.category || defaultCategoryId,
			}
			updateFormData(partial)
			const result = await saveStep('basics-primary', { ...formData, ...partial })
			if (mode === 'create' && result.projectSlug) {
				return
			}
			goToNextStep()
		},
		[formData, defaultCategoryId, updateFormData, saveStep, mode, goToNextStep],
	)

	const handleSaveLater = useCallback(() => {
		if (projectSlug) {
			router.push(`/projects/${projectSlug}/manage`)
		}
	}, [projectSlug, router])

	const handleFinish = useCallback(async () => {
		await saveStep('review', formData)
		if (projectSlug) {
			router.push(`/projects/${projectSlug}/manage`)
		}
	}, [saveStep, formData, projectSlug, router])

	const stepContent = useMemo(() => {
		switch (currentStep) {
			case 'language':
				return <WizardLanguageStep onContinue={handleLanguageContinue} />
			case 'basics-primary':
				return (
					<WizardBasicsPrimaryStep
						onBack={goToPreviousStep}
						onContinue={handleBasicsPrimaryContinue}
						isSaving={isSaving}
					/>
				)
			case 'story-primary':
				return (
					<WizardStoryPrimaryStep
						onBack={goToPreviousStep}
						onContinue={(data) => persistAndAdvance(data, 'story-primary')}
						isSaving={isSaving}
					/>
				)
			case 'highlights-primary':
				return (
					<WizardHighlightsStep
						variant="primary"
						onBack={goToPreviousStep}
						onContinue={(highlights) => {
							const withSyncedTranslations =
								formData.translationHighlights.length < highlights.length
									? highlights.map((_, index) => ({
											id: formData.translationHighlights[index]?.id ?? `translation-${index}`,
											title: formData.translationHighlights[index]?.title ?? '',
											description: formData.translationHighlights[index]?.description ?? '',
										}))
									: formData.translationHighlights
							return persistAndAdvance(
								{ highlights, translationHighlights: withSyncedTranslations },
								'highlights-primary',
							)
						}}
						isSaving={isSaving}
					/>
				)
			case 'basics-translation':
				return (
					<WizardBasicsTranslationStep
						onBack={goToPreviousStep}
						onContinue={(data) => persistAndAdvance(data, 'basics-translation')}
						onSaveLater={handleSaveLater}
						isSaving={isSaving}
					/>
				)
			case 'story-translation':
				return (
					<WizardStoryTranslationStep
						onBack={goToPreviousStep}
						onContinue={(data) => persistAndAdvance(data, 'story-translation')}
						onSaveLater={handleSaveLater}
						isSaving={isSaving}
					/>
				)
			case 'highlights-translation':
				return (
					<WizardHighlightsStep
						variant="translation"
						onBack={goToPreviousStep}
						onContinue={(translationHighlights) =>
							persistAndAdvance({ translationHighlights }, 'highlights-translation')
						}
						onSaveLater={handleSaveLater}
						isSaving={isSaving}
					/>
				)
			case 'media':
				return (
					<WizardMediaStep
						onBack={goToPreviousStep}
						onContinue={(data) => persistAndAdvance(data, 'media')}
						isSaving={isSaving}
					/>
				)
			case 'location':
				return (
					<WizardLocationStep
						onBack={goToPreviousStep}
						onContinue={(data) => persistAndAdvance(data, 'location')}
						isSaving={isSaving}
					/>
				)
			case 'review':
				return (
					<WizardReviewStep onBack={goToPreviousStep} onFinish={handleFinish} isSaving={isSaving} />
				)
			default:
				return <WizardLanguageStep onContinue={handleLanguageContinue} />
		}
	}, [
		currentStep,
		goToPreviousStep,
		handleLanguageContinue,
		handleBasicsPrimaryContinue,
		persistAndAdvance,
		handleSaveLater,
		handleFinish,
		isSaving,
		formData.translationHighlights,
	])

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<ManageSectionHeader
				title={t('projects.manage.contentWizard.title')}
				description={t('projects.manage.contentWizard.subtitle')}
				actions={
					<p className="text-sm text-muted-foreground tabular-nums">
						{t('projects.manage.contentWizard.translationProgress')}:{' '}
						<span className="font-medium text-foreground">{translationStatus.overallPercent}%</span>
					</p>
				}
			/>

			<ContentWizardStepIndicator
				currentStep={currentStep}
				sourceLocale={formData.sourceLocale ?? 'en'}
				stepValidation={steps}
				onStepClick={setCurrentStep}
			/>

			<AnimatePresence mode="wait">
				<motion.div
					key={currentStep}
					initial={{ opacity: 0, x: 12 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -12 }}
					transition={{ duration: 0.2 }}
				>
					{stepContent}
				</motion.div>
			</AnimatePresence>
		</div>
	)
}
