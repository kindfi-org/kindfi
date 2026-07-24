'use client'

import { useForm } from 'react-hook-form'
import { ContentLanguageSelector } from '~/components/shared/content-language-selector'
import { useContentWizard } from '~/hooks/contexts/use-content-wizard.context'
import { zodResolver } from '~/lib/form/zod-resolver'
import { useI18n } from '~/lib/i18n/context'
import { wizardLanguageSchema } from '~/lib/schemas/content-wizard.schemas'
import type { SupportedLocale } from '~/lib/schemas/locale.schemas'
import { WizardStepShell } from '../wizard-step-shell'

type LanguageStepProps = {
	onContinue: () => void
}

export function WizardLanguageStep({ onContinue }: LanguageStepProps) {
	const { t } = useI18n()
	const { formData, updateFormData, sourceLocaleLocked } = useContentWizard()

	const form = useForm<{ sourceLocale: SupportedLocale }>({
		resolver: zodResolver(wizardLanguageSchema),
		defaultValues: { sourceLocale: formData.sourceLocale ?? 'en' },
	})

	const handleContinue = () => {
		const values = form.getValues()
		updateFormData({ sourceLocale: values.sourceLocale })
		onContinue()
	}

	return (
		<WizardStepShell
			title={t('projects.manage.contentWizard.stepLanguage')}
			description={t('projects.manage.contentLanguageHelp')}
			onContinue={form.handleSubmit(handleContinue)}
			showBack={false}
		>
			<ContentLanguageSelector
				value={form.watch('sourceLocale')}
				onChange={(locale) => form.setValue('sourceLocale', locale)}
				disabled={sourceLocaleLocked}
				helpText={t('projects.manage.contentLanguageHelp')}
			/>
		</WizardStepShell>
	)
}
