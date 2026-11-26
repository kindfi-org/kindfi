'use client'

import { useContentWizard } from '~/hooks/contexts/use-content-wizard.context'
import { useI18n } from '~/lib/i18n/context'
import { WizardStepShell } from '../wizard-step-shell'

type WizardReviewStepProps = {
	onFinish: () => void | Promise<void>
	onBack: () => void
	isSaving?: boolean
}

export function WizardReviewStep({ onFinish, onBack, isSaving = false }: WizardReviewStepProps) {
	const { t } = useI18n()
	const { formData } = useContentWizard()
	const sourceLocale = formData.sourceLocale ?? 'en'

	return (
		<WizardStepShell
			title={t('projects.manage.contentWizard.stepReview')}
			description={t('projects.manage.contentWizard.subtitle')}
			onBack={onBack}
			onContinue={onFinish}
			continueLabel={t('projects.manage.contentWizard.finish')}
			isSaving={isSaving}
		>
			<div className="space-y-4">
				<ReviewSection
					title={`${sourceLocale === 'en' ? 'English' : 'Spanish'} — ${t('projects.manage.contentWizard.stepBasics')}`}
					items={[
						{ label: 'Title', value: formData.title },
						{ label: 'Description', value: formData.description },
					]}
				/>
				<ReviewSection
					title={t('projects.manage.contentWizard.stepStory')}
					items={[{ label: 'Title', value: formData.pitchTitle }]}
				/>
				<ReviewSection
					title={t('projects.manage.contentWizard.stepHighlights')}
					items={formData.highlights.map((h, i) => ({
						label: `Highlight ${i + 1}`,
						value: h.title,
					}))}
				/>
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
