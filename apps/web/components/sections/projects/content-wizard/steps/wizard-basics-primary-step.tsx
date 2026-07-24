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
import { wizardBasicsPrimarySchema } from '~/lib/schemas/content-wizard.schemas'
import { WizardStepShell } from '../wizard-step-shell'

type WizardBasicsPrimaryStepProps = {
	onContinue: (data: BasicsFormValues) => void | Promise<void>
	onBack: () => void
	isSaving?: boolean
}

type BasicsFormValues = {
	title: string
	description: string
	targetAmount: number
	minimumInvestment: number
}

export function WizardBasicsPrimaryStep({
	onContinue,
	onBack,
	isSaving = false,
}: WizardBasicsPrimaryStepProps) {
	const { t } = useI18n()
	const { formData } = useContentWizard()

	const form = useForm<BasicsFormValues>({
		resolver: zodResolver(wizardBasicsPrimarySchema),
		defaultValues: {
			title: formData.title ?? '',
			description: formData.description ?? '',
			targetAmount: formData.targetAmount || undefined,
			minimumInvestment: formData.minimumInvestment || undefined,
		},
	})

	return (
		<WizardStepShell
			title={t('projects.manage.contentWizard.stepBasics')}
			description={t('projects.manage.contentWizard.phasePrimary')}
			onBack={onBack}
			onContinue={form.handleSubmit(onContinue)}
			isSaving={isSaving}
		>
			<Form {...form}>
				<div className="space-y-6">
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Title <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<Input placeholder="Enter your project title" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Description <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Describe your project in a few sentences"
										className="min-h-[100px]"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="targetAmount"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Target amount <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<div className="relative">
										<span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
											$
										</span>
										<Input
											type="number"
											className="pl-7"
											value={field.value ?? ''}
											onChange={(e) =>
												field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
											}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="minimumInvestment"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Minimum investment <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<div className="relative">
										<span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
											$
										</span>
										<Input
											type="number"
											className="pl-7"
											value={field.value ?? ''}
											onChange={(e) =>
												field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
											}
										/>
									</div>
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
