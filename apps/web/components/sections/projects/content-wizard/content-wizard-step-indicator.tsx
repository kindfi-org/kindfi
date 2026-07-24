'use client'

import { Check } from 'lucide-react'
import type { StepValidation } from '~/components/sections/projects/content-wizard/hooks/use-content-wizard-validation'
import { useI18n } from '~/lib/i18n/context'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import { getOppositeLocale } from '~/lib/schemas/locale.schemas'
import type { ContentWizardStep } from '~/lib/types/project/content-wizard.types'
import { cn } from '~/lib/utils'

type StepGroup = {
	id: string
	label: string
	steps: { id: ContentWizardStep; label: string }[]
}

const getStepGroups = (sourceLocale: SupportedLocale, t: (key: string) => string): StepGroup[] => {
	const opposite = getOppositeLocale(sourceLocale)
	const oppositeLabel = opposite === 'en' ? 'English' : 'Spanish'

	return [
		{
			id: 'primary',
			label: t('projects.manage.contentWizard.phasePrimary'),
			steps: [
				{ id: 'language', label: t('projects.manage.contentWizard.stepLanguage') },
				{ id: 'basics-primary', label: t('projects.manage.contentWizard.stepBasics') },
				{ id: 'story-primary', label: t('projects.manage.contentWizard.stepStory') },
				{ id: 'highlights-primary', label: t('projects.manage.contentWizard.stepHighlights') },
			],
		},
		{
			id: 'translation',
			label: `${t('projects.manage.contentWizard.phaseTranslation')} (${oppositeLabel})`,
			steps: [
				{ id: 'basics-translation', label: t('projects.manage.contentWizard.stepBasics') },
				{ id: 'story-translation', label: t('projects.manage.contentWizard.stepStory') },
				{ id: 'highlights-translation', label: t('projects.manage.contentWizard.stepHighlights') },
			],
		},
		{
			id: 'setup',
			label: t('projects.manage.contentWizard.phaseSetup'),
			steps: [
				{ id: 'media', label: t('projects.manage.contentWizard.stepMedia') },
				{ id: 'location', label: t('projects.manage.contentWizard.stepLocation') },
				{ id: 'review', label: t('projects.manage.contentWizard.stepReview') },
			],
		},
	]
}

interface ContentWizardStepIndicatorProps {
	currentStep: ContentWizardStep
	sourceLocale: SupportedLocale
	stepValidation: Record<ContentWizardStep, StepValidation>
	onStepClick?: (step: ContentWizardStep) => void
}

export function ContentWizardStepIndicator({
	currentStep,
	sourceLocale,
	stepValidation,
	onStepClick,
}: ContentWizardStepIndicatorProps) {
	const { t } = useI18n()
	const groups = getStepGroups(sourceLocale, t)

	const flatSteps = groups.flatMap((g) => g.steps)
	const currentIndex = flatSteps.findIndex((s) => s.id === currentStep)

	return (
		<nav aria-label="Content wizard progress" className="w-full space-y-4">
			{groups.map((group) => (
				<div key={group.id} className="space-y-2">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{group.label}
					</p>
					<ol className="flex flex-wrap gap-2">
						{group.steps.map((step) => {
							const stepIndex = flatSteps.findIndex((s) => s.id === step.id)
							const isCurrent = step.id === currentStep
							const isPast = stepIndex < currentIndex
							const isComplete = stepValidation[step.id].valid && (isPast || isCurrent)
							const isIncomplete = !stepValidation[step.id].valid && !isCurrent
							const isClickable = Boolean(onStepClick) && (isPast || stepValidation[step.id].valid)

							return (
								<li key={step.id}>
									<button
										type="button"
										disabled={!isClickable}
										onClick={() => {
											if (isClickable) onStepClick?.(step.id)
										}}
										className={cn(
											'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
											isComplete && !isCurrent
												? 'border-emerald-600/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
												: null,
											isCurrent
												? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
												: null,
											isIncomplete ? 'border-border bg-background text-muted-foreground' : null,
											isClickable ? 'cursor-pointer hover:border-blue-500/50' : 'cursor-default',
										)}
										aria-current={isCurrent ? 'step' : undefined}
									>
										{isComplete && !isCurrent ? (
											<Check className="h-3.5 w-3.5" aria-hidden="true" />
										) : (
											<span
												className={cn(
													'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
													isCurrent ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground',
												)}
											>
												{stepIndex + 1}
											</span>
										)}
										{step.label}
									</button>
								</li>
							)
						})}
					</ol>
				</div>
			))}
		</nav>
	)
}
