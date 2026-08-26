'use client'

import dynamic from 'next/dynamic'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import { wizardStoryPrimarySchema } from '~/lib/schemas/content-wizard.schemas'
import { WizardStepShell } from '../wizard-step-shell'

const storyPrimaryFormSchema = z.object({
	pitchTitle: wizardStoryPrimarySchema.shape.title,
	pitchStory: wizardStoryPrimarySchema.shape.story,
})

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

type StoryFormValues = {
	pitchTitle: string
	pitchStory: string
}

type WizardStoryPrimaryStepProps = {
	onContinue: (data: StoryFormValues) => void | Promise<void>
	onBack: () => void
	isSaving?: boolean
}

export function WizardStoryPrimaryStep({
	onContinue,
	onBack,
	isSaving = false,
}: WizardStoryPrimaryStepProps) {
	const { t } = useI18n()
	const { formData } = useContentWizard()

	const form = useForm<StoryFormValues>({
		resolver: zodResolver(storyPrimaryFormSchema),
		defaultValues: {
			pitchTitle: formData.pitchTitle ?? '',
			pitchStory: formData.pitchStory ?? '',
		},
	})

	const handleContinue = form.handleSubmit((data) => {
		onContinue(data)
	})

	return (
		<WizardStepShell
			title={t('projects.manage.contentWizard.stepStory')}
			description={t('projects.manage.contentWizard.phasePrimary')}
			onBack={onBack}
			onContinue={handleContinue}
			isSaving={isSaving}
		>
			<Form {...form}>
				<div className="space-y-6">
					<FormField
						control={form.control}
						name="pitchTitle"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Story title <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<Input placeholder="Enter your story title" maxLength={100} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="pitchStory"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Story <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<RichTextEditor
										value={field.value}
										onChange={field.onChange}
										error={form.formState.errors.pitchStory?.message}
									/>
								</FormControl>
								<FormDescription>
									Describe the problem, your solution, and the impact you aim to achieve.
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
