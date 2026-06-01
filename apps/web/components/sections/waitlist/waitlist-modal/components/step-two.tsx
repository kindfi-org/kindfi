'use client'

import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Button } from '~/components/base/button'
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
import { useWaitlist } from '~/hooks/contexts/use-waitlist.context'
import { zodResolver } from '~/lib/form/zod-resolver'
import { useI18n } from '~/lib/i18n'
import { waitlistStepTwoSchema } from '~/lib/schemas/waitlist.schemas'
import type { WaitlistStepTwoData } from '~/lib/types/waitlist.types'
import { WaitlistStepActions } from './waitlist-step-actions'

interface StepTwoProps {
	onNext: () => void
	onBack: () => void
}

export function StepTwo({ onNext, onBack }: StepTwoProps) {
	const { t } = useI18n()
	const { formData, updateFormData } = useWaitlist()
	const form = useForm<WaitlistStepTwoData>({
		resolver: zodResolver<WaitlistStepTwoData>(waitlistStepTwoSchema),
		defaultValues: {
			projectName: formData.projectName || '',
			projectDescription: formData.projectDescription || '',
			location: formData.location || '',
		},
	})

	const onSubmit = (data: WaitlistStepTwoData) => {
		updateFormData({ ...data })
		onNext()
	}

	const handleSkip = () => {
		updateFormData({
			projectName: '',
			projectDescription: '',
			location: '',
		})
		onNext()
	}

	return (
		<motion.div
			key="waitlist-step-two"
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -12 }}
			transition={{ duration: 0.25 }}
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
					<FormField
						control={form.control}
						name="projectName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('waitlist.fields.projectName')}</FormLabel>
								<FormControl>
									<Input placeholder={t('waitlist.fields.projectNamePlaceholder')} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="projectDescription"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('waitlist.fields.projectDescription')}</FormLabel>
								<FormControl>
									<Textarea
										rows={4}
										placeholder={t('waitlist.fields.projectDescriptionPlaceholder')}
										className="resize-none"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="location"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('waitlist.fields.location')}</FormLabel>
								<FormControl>
									<Input placeholder={t('waitlist.fields.locationPlaceholder')} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<WaitlistStepActions
						onBack={onBack}
						primaryLabel={t('waitlist.actions.continue')}
						secondaryAction={
							<Button type="button" variant="ghost" onClick={handleSkip}>
								{t('waitlist.actions.skip')}
							</Button>
						}
					/>
				</form>
			</Form>
		</motion.div>
	)
}
