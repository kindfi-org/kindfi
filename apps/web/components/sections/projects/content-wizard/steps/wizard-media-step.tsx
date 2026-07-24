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
import { ImageUpload } from '~/components/sections/projects/create/image-upload'
import { SocialLinks } from '~/components/sections/projects/create/social-links'
import { useContentWizard } from '~/hooks/contexts/use-content-wizard.context'
import { zodResolver } from '~/lib/form/zod-resolver'
import { useI18n } from '~/lib/i18n/context'
import { wizardMediaSchema } from '~/lib/schemas/content-wizard.schemas'
import type { StepTwoData } from '~/lib/types/project/create-project.types'
import { WizardStepShell } from '../wizard-step-shell'

type WizardMediaStepProps = {
	onContinue: (data: StepTwoData) => void | Promise<void>
	onBack: () => void
	isSaving?: boolean
}

export function WizardMediaStep({ onContinue, onBack, isSaving = false }: WizardMediaStepProps) {
	const { t } = useI18n()
	const { formData } = useContentWizard()

	const form = useForm<StepTwoData>({
		resolver: zodResolver(wizardMediaSchema),
		defaultValues: {
			image: formData.image ?? null,
			website: formData.website ?? '',
			socialLinks: formData.socialLinks ?? [],
		},
	})

	return (
		<WizardStepShell
			title={t('projects.manage.contentWizard.stepMedia')}
			description={t('projects.manage.contentWizard.phaseSetup')}
			onBack={onBack}
			onContinue={form.handleSubmit((data) =>
				onContinue({ ...data, socialLinks: data.socialLinks ?? [] }),
			)}
			isSaving={isSaving}
		>
			<Form {...form}>
				<div className="space-y-6">
					<FormField
						control={form.control}
						name="image"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Project image (optional)</FormLabel>
								<FormControl>
									<ImageUpload
										value={field.value}
										onChange={field.onChange}
										error={form.formState.errors.image?.message as string | undefined}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="website"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Website (optional)</FormLabel>
								<FormControl>
									<Input placeholder="https://example.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="socialLinks"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Social links (optional)</FormLabel>
								<FormControl>
									<SocialLinks value={field.value ?? []} onChange={field.onChange} />
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
