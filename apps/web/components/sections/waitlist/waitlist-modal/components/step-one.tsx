'use client'

import { zodResolver } from '~/lib/form/zod-resolver'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Button } from '~/components/base/button'
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
import { RadioGroup, RadioGroupItem } from '~/components/base/radio-group'
import { useWaitlist } from '~/hooks/contexts/use-waitlist.context'
import { useI18n } from '~/lib/i18n'
import { waitlistStepOneSchema } from '~/lib/schemas/waitlist.schemas'
import type { WaitlistStepOneData } from '~/lib/types/waitlist.types'
import { cn } from '~/lib/utils'
import { ROLE_OPTIONS } from '../constants'
import { WaitlistStepActions } from './waitlist-step-actions'

interface StepOneProps {
	onNext: () => void
}

export function StepOne({ onNext }: StepOneProps) {
	const { t } = useI18n()
	const { formData, updateFormData } = useWaitlist()
	const form = useForm<WaitlistStepOneData>({
		resolver: zodResolver<WaitlistStepOneData>(waitlistStepOneSchema),
		defaultValues: {
			name: formData.name,
			email: formData.email || '',
			role: formData.role,
		},
	})

	const onSubmit = (data: WaitlistStepOneData) => {
		updateFormData({ ...data, email: data.email || undefined })
		onNext()
	}

	return (
		<motion.div
			key="waitlist-step-one"
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -12 }}
			transition={{ duration: 0.25 }}
		>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
					<div className="grid gap-4 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="sm:col-span-2">
									<FormLabel>{t('waitlist.fields.name')}</FormLabel>
									<FormControl>
										<Input
											autoComplete="name"
											placeholder={t('waitlist.fields.namePlaceholder')}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="sm:col-span-2">
									<FormLabel>{t('waitlist.fields.email')}</FormLabel>
									<FormControl>
										<Input
											type="email"
											autoComplete="email"
											placeholder={t('waitlist.fields.emailPlaceholder')}
											{...field}
										/>
									</FormControl>
									<FormDescription>
										{t('waitlist.fields.emailHint')}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="role"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('waitlist.fields.role')}</FormLabel>
								<FormControl>
									<RadioGroup
										onValueChange={field.onChange}
										value={field.value}
										className="grid gap-3"
									>
										{ROLE_OPTIONS.map((role) => {
											const Icon = role.icon
											const isSelected = field.value === role.value

											return (
												<FormItem key={role.value}>
													<FormControl>
														<label
															className={cn(
																'flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all',
																isSelected
																	? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
																	: 'border-slate-200 bg-white hover:border-emerald-200',
															)}
														>
															<RadioGroupItem
																value={role.value}
																className="sr-only"
															/>
															<div
																className={cn(
																	'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
																	isSelected
																		? 'bg-emerald-600 text-white'
																		: 'bg-slate-100 text-slate-600',
																)}
															>
																<Icon className="h-5 w-5" />
															</div>
															<div className="space-y-1 text-left">
																<p className="text-sm font-semibold text-slate-900">
																	{t(role.labelKey)}
																</p>
																<p className="text-sm leading-relaxed text-muted-foreground">
																	{t(role.descriptionKey)}
																</p>
															</div>
														</label>
													</FormControl>
												</FormItem>
											)
										})}
									</RadioGroup>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<WaitlistStepActions
						showBack={false}
						primaryLabel={t('waitlist.actions.continue')}
					/>
				</form>
			</Form>
		</motion.div>
	)
}
