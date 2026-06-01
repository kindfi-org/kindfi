'use client'

import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Checkbox } from '~/components/base/checkbox'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { useWaitlist } from '~/hooks/contexts/use-waitlist.context'
import { zodResolver } from '~/lib/form/zod-resolver'
import { useI18n } from '~/lib/i18n'
import { waitlistStepThreeSchema } from '~/lib/schemas/waitlist.schemas'
import type { WaitlistStepThreeData } from '~/lib/types/waitlist.types'
import { WaitlistReviewSummary } from './waitlist-review-summary'
import { WaitlistStepActions } from './waitlist-step-actions'

interface StepThreeProps {
	onBack: () => void
	onSubmit: (data: WaitlistStepThreeData) => void
	isPending?: boolean
}

export function StepThree({ onBack, onSubmit, isPending = false }: StepThreeProps) {
	const { t } = useI18n()
	const { formData, updateFormData } = useWaitlist()
	const form = useForm<WaitlistStepThreeData>({
		resolver: zodResolver<WaitlistStepThreeData>(waitlistStepThreeSchema),
		defaultValues: {
			source: formData.source || '',
			consent: formData.consent,
		},
	})

	const handleSubmit = (data: WaitlistStepThreeData) => {
		updateFormData(data)
		onSubmit(data)
	}

	return (
		<motion.div
			key="waitlist-step-three"
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -12 }}
			transition={{ duration: 0.25 }}
		>
			<div className="space-y-5">
				<WaitlistReviewSummary />

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
						<FormField
							control={form.control}
							name="source"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('waitlist.fields.source')}</FormLabel>
									<FormControl>
										<Input placeholder={t('waitlist.fields.sourcePlaceholder')} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="consent"
							render={({ field }) => (
								<FormItem>
									<div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												className="mt-0.5"
											/>
										</FormControl>
										<div className="space-y-1">
											<FormLabel className="text-sm font-normal leading-relaxed text-slate-700">
												{t('waitlist.consent')}
											</FormLabel>
											<FormMessage />
										</div>
									</div>
								</FormItem>
							)}
						/>

						<WaitlistStepActions
							onBack={onBack}
							primaryLabel={t('waitlist.actions.submit')}
							isPending={isPending}
						/>
					</form>
				</Form>
			</div>
		</motion.div>
	)
}
