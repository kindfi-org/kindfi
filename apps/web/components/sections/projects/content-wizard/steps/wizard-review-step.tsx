'use client'

import { Badge } from '~/components/base/badge'
import { useContentWizard } from '~/hooks/contexts/use-content-wizard.context'
import { useI18n } from '~/lib/i18n/context'
import { getOppositeLocale } from '~/lib/schemas/locale.schemas'
import type { TranslationSectionStatus } from '~/lib/types/project/content-wizard.types'
import { useContentWizardValidation } from '../hooks/use-content-wizard-validation'
import { WizardStepShell } from '../wizard-step-shell'

type WizardReviewStepProps = {
	onFinish: () => void | Promise<void>
	onBack: () => void
	isSaving?: boolean
}

const statusLabel = (status: TranslationSectionStatus, t: (key: string) => string): string => {
	switch (status) {
		case 'complete':
			return t('projects.manage.contentWizard.statusComplete')
		case 'partial':
			return t('projects.manage.contentWizard.statusInProgress')
		default:
			return t('projects.manage.contentWizard.statusNotStarted')
	}
}

const statusVariant = (status: TranslationSectionStatus) => {
	switch (status) {
		case 'complete':
			return 'default' as const
		case 'partial':
			return 'secondary' as const
		default:
			return 'outline' as const
	}
}

export function WizardReviewStep({ onFinish, onBack, isSaving = false }: WizardReviewStepProps) {
	const { t } = useI18n()
	const { formData } = useContentWizard()
	const { translationStatus } = useContentWizardValidation(formData)
	const sourceLocale = formData.sourceLocale ?? 'en'
	const oppositeLocale = getOppositeLocale(sourceLocale)

	return (
		<WizardStepShell
			title={t('projects.manage.contentWizard.stepReview')}
			description={t('projects.manage.contentWizard.subtitle')}
			onBack={onBack}
			onContinue={onFinish}
			continueLabel={t('projects.manage.contentWizard.finish')}
			isSaving={isSaving}
		>
			<div className="space-y-6">
				<div className="rounded-lg border bg-muted/30 p-4">
					<p className="text-sm font-medium">
						{t('projects.manage.contentWizard.translationProgress')}:{' '}
						{translationStatus.overallPercent}%
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{t('projects.manage.contentWizard.translationProgressDescription')}
					</p>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<ReviewSection
						title={`${sourceLocale === 'en' ? 'English' : 'Spanish'} — ${t('projects.manage.contentWizard.stepBasics')}`}
						items={[
							{ label: 'Title', value: formData.title },
							{ label: 'Description', value: formData.description },
						]}
					/>
					<ReviewSection
						title={`${oppositeLocale === 'en' ? 'English' : 'Spanish'} — ${t('projects.manage.contentWizard.stepBasics')}`}
						items={[
							{ label: 'Title', value: formData.translation?.title ?? '' },
							{ label: 'Description', value: formData.translation?.description ?? '' },
						]}
					/>
				</div>

				<div className="flex flex-wrap gap-2">
					<Badge variant={statusVariant(translationStatus.basics)}>
						{t('projects.manage.contentWizard.stepBasics')}:{' '}
						{statusLabel(translationStatus.basics, t)}
					</Badge>
					<Badge variant={statusVariant(translationStatus.story)}>
						{t('projects.manage.contentWizard.stepStory')}:{' '}
						{statusLabel(translationStatus.story, t)}
					</Badge>
					<Badge variant={statusVariant(translationStatus.highlights)}>
						{t('projects.manage.contentWizard.stepHighlights')}:{' '}
						{statusLabel(translationStatus.highlights, t)}
					</Badge>
				</div>
			</div>
		</WizardStepShell>
	)
}

function ReviewSection({
	title,
	items,
}: {
	title: string
	items: Array<{ label: string; value: string }>
}) {
	return (
		<div className="rounded-lg border p-4 space-y-2">
			<p className="font-medium text-sm">{title}</p>
			{items.map((item) => (
				<div key={item.label}>
					<p className="text-xs text-muted-foreground">{item.label}</p>
					<p className="text-sm line-clamp-3">{item.value || '—'}</p>
				</div>
			))}
		</div>
	)
}
