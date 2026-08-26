'use client'

import dynamic from 'next/dynamic'
import { useForm } from 'react-hook-form'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { useContentWizard } from '~/hooks/contexts/use-content-wizard.context'
import { zodResolver } from '~/lib/form/zod-resolver'
import { useI18n } from '~/lib/i18n/context'
import { wizardStoryTranslationSchema } from '~/lib/schemas/content-wizard.schemas'
import { getOppositeLocale } from '~/lib/schemas/locale.schemas'
import { SourcePreviewAccordion } from '../source-preview-accordion'
import { WizardStepShell } from '../wizard-step-shell'

const RichTextEditor = dynamic(
	() =>
		import('~/components/sections/projects/pitch/rich-text-editor').then(
			(mod) => mod.RichTextEditor,
		),
	{
		ssr: false,
		loading: () => <div className="h-48 animate-pulse rounded-md bg-muted" />,
	},
)

type WizardStoryTranslationStepProps = {
	onContinue: (data: { pitchTranslation: { title: string; story: string } }) => void | Promise<void>
	onBack: () => void
	onSaveLater?: () => void
	isSaving?: boolean
}

export function WizardStoryTranslationStep({
	onContinue,
	onBack,
	onSaveLater,
	isSaving = false,
}: WizardStoryTranslationStepProps) {
	const { t } = useI18n()
	const { formData } = useContentWizard()
	const oppositeLocale = getOppositeLocale(formData.sourceLocale ?? 'en')
	const oppositeLabel = oppositeLocale === 'en' ? 'English' : 'Spanish'

	const form = useForm({
		resolver: zodResolver(wizardStoryTranslationSchema),
		defaultValues: {
			pitchTranslation: {
				title: formData.pitchTranslation?.title ?? '',
				story: formData.pitchTranslation?.story ?? '',
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
			<SourcePreviewAccordion title={formData.pitchTitle} story={formData.pitchStory} />
			<Form {...form}>
				<div className="space-y-6">
					<FormField
						control={form.control}
						name="pitchTranslation.title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Story title <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<Input placeholder="Translated story title" maxLength={100} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="pitchTranslation.story"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Story <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<RichTextEditor
										value={field.value ?? ''}
										onChange={field.onChange}
										error={form.formState.errors.pitchTranslation?.story?.message}
									/>
								</FormControl>
								<FormDescription>
									{t('projects.manage.translationSectionDescription')}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</Form>
		</WizardStepShell>
	)
}
