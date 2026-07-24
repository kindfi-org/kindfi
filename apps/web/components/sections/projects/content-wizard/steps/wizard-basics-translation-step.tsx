'use client'

import { useForm } from 'react-hook-form'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { Textarea } from '~/components/base/textarea'
import { useContentWizard } from '~/hooks/contexts/use-content-wizard.context'
import { zodResolver } from '~/lib/form/zod-resolver'
import { useI18n } from '~/lib/i18n/context'
import { wizardBasicsTranslationSchema } from '~/lib/schemas/content-wizard.schemas'
import { getOppositeLocale } from '~/lib/schemas/locale.schemas'
import { SourcePreviewAccordion } from '../source-preview-accordion'
import { WizardStepShell } from '../wizard-step-shell'

type TranslationFormValues = {
	translation: {
		title: string
		description: string
	}
}

type WizardBasicsTranslationStepProps = {
	onContinue: (data: TranslationFormValues) => void | Promise<void>
	onBack: () => void
	onSaveLater?: () => void
	isSaving?: boolean
}

export function WizardBasicsTranslationStep({
	onContinue,
	onBack,
	onSaveLater,
	isSaving = false,
}: WizardBasicsTranslationStepProps) {
	const { t } = useI18n()
	const { formData } = useContentWizard()
	const sourceLocale = formData.sourceLocale ?? 'en'
	const oppositeLocale = getOppositeLocale(sourceLocale)
	const oppositeLabel = oppositeLocale === 'en' ? 'English' : 'Spanish'

	const form = useForm<TranslationFormValues>({
		resolver: zodResolver(wizardBasicsTranslationSchema),
		defaultValues: {
			translation: {
				title: formData.translation?.title ?? '',
				description: formData.translation?.description ?? '',
			},
		},
	})

	return (
		<WizardStepShell
			title={t('projects.manage.contentWizard.translationPhaseTitle').replace(
				'{language}',
				oppositeLabel,
			)}
			description={t('projects.manage.contentWizard.translationPhaseDescription').replace(
				'{language}',
				oppositeLabel,
			)}
			onBack={onBack}
			onContinue={form.handleSubmit(onContinue)}
			onSaveLater={onSaveLater}
			showSaveLater={Boolean(onSaveLater)}
			isSaving={isSaving}
		>
			<SourcePreviewAccordion title={formData.title} description={formData.description} />
			<Form {...form}>
				<div className="space-y-6">
					<FormField
						control={form.control}
						name="translation.title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Title <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<Input placeholder="Translated title" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="translation.description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Description <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Translated description"
										className="min-h-[100px]"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</Form>
		</WizardStepShell>
	)
}
