'use client'

import { zodResolver } from '~/lib/form/zod-resolver'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Building2,
	CheckCircle2,
	HandHeart,
	Handshake,
	Loader2,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '~/components/base/button'
import { Checkbox } from '~/components/base/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '~/components/base/dialog'
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
import { Textarea } from '~/components/base/textarea'
import { useWaitlist } from '~/hooks/contexts/use-waitlist.context'
import { useI18n } from '~/lib/i18n'
import {
	waitlistStepOneSchema,
	waitlistStepThreeSchema,
	waitlistStepTwoSchema,
} from '~/lib/schemas/waitlist.schemas'
import type {
	WaitlistFormData,
	WaitlistRole,
	WaitlistStepOneData,
	WaitlistStepThreeData,
	WaitlistStepTwoData,
} from '~/lib/types/waitlist.types'
import { cn } from '~/lib/utils'

interface WaitlistModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

const TOTAL_STEPS = 3

const ROLE_OPTIONS: Array<{
	value: WaitlistRole
	icon: typeof Building2
	labelKey: string
	descriptionKey: string
}> = [
	{
		value: 'project_creator',
		icon: Building2,
		labelKey: 'waitlist.roles.projectCreator',
		descriptionKey: 'waitlist.roles.projectCreatorDesc',
	},
	{
		value: 'supporter',
		icon: HandHeart,
		labelKey: 'waitlist.roles.supporter',
		descriptionKey: 'waitlist.roles.supporterDesc',
	},
	{
		value: 'partner',
		icon: Handshake,
		labelKey: 'waitlist.roles.partner',
		descriptionKey: 'waitlist.roles.partnerDesc',
	},
]

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
	const { t } = useI18n()
	const {
		currentStep,
		setCurrentStep,
		formData,
		resetWaitlist,
	} = useWaitlist()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)
	const [submitError, setSubmitError] = useState<string | null>(null)

	const stepCopy = [
		{
			title: t('waitlist.stepOneTitle'),
			description: t('waitlist.stepOneDescription'),
		},
		{
			title: t('waitlist.stepTwoTitle'),
			description: t('waitlist.stepTwoDescription'),
		},
		{
			title: t('waitlist.stepThreeTitle'),
			description: t('waitlist.stepThreeDescription'),
		},
	]

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			resetWaitlist()
			setIsSuccess(false)
			setSubmitError(null)
		}
		onOpenChange(nextOpen)
	}

	const handleNext = () => {
		if (currentStep < TOTAL_STEPS) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleSubmit = async (data: WaitlistStepThreeData) => {
		setIsSubmitting(true)
		setSubmitError(null)

		try {
			const body: WaitlistFormData = { ...formData, ...data }
			const res = await fetch('/api/waitlist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})

			if (!res.ok) {
				const err = await res.json().catch(() => ({}) as unknown)
				const message =
					typeof err === 'object' &&
					err !== null &&
					'error' in err &&
					typeof err.error === 'string'
						? err.error
						: t('waitlist.errors.submitFailed')
				throw new Error(message)
			}

			setIsSuccess(true)
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: t('waitlist.errors.submitFailed'),
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return <StepOne onNext={handleNext} />
			case 2:
				return <StepTwo onNext={handleNext} onBack={handleBack} />
			case 3:
				return (
					<StepThree
						onBack={handleBack}
						onSubmit={handleSubmit}
						isPending={isSubmitting}
					/>
				)
			default:
				return <StepOne onNext={handleNext} />
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
				{isSuccess ? (
					<WaitlistSuccess onClose={() => handleOpenChange(false)} />
				) : (
					<>
						<div className="border-b bg-[#fafbfc] px-6 pb-5 pt-6">
							<DialogHeader className="mt-0 space-y-2 text-left">
								<p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
									{t('waitlist.stepLabel')} {currentStep} / {TOTAL_STEPS}
								</p>
								<DialogTitle className="text-xl font-bold tracking-tight sm:text-2xl">
									{stepCopy[currentStep - 1]?.title}
								</DialogTitle>
								<DialogDescription className="text-sm leading-relaxed">
									{stepCopy[currentStep - 1]?.description}
								</DialogDescription>
							</DialogHeader>

							<WaitlistProgress currentStep={currentStep} />
						</div>

						<div className="max-h-[min(68vh,560px)] overflow-y-auto px-6 py-6">
							{submitError ? (
								<div
									role="alert"
									className="mb-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
								>
									{submitError}
								</div>
							) : null}

							<AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}

function WaitlistProgress({ currentStep }: { currentStep: number }) {
	return (
		<div className="mt-5 flex gap-2">
			{Array.from({ length: TOTAL_STEPS }).map((_, index) => {
				const stepNumber = index + 1
				const isActive = currentStep === stepNumber
				const isCompleted = currentStep > stepNumber

				return (
					<div
						key={stepNumber}
						className={cn(
							'h-1.5 flex-1 rounded-full transition-colors duration-300',
							isActive && 'bg-emerald-600',
							isCompleted && 'bg-emerald-500/70',
							!isActive && !isCompleted && 'bg-slate-200',
						)}
					/>
				)
			})}
		</div>
	)
}

function WaitlistSuccess({ onClose }: { onClose: () => void }) {
	const { t } = useI18n()

	return (
		<div className="flex flex-col items-center px-6 py-10 text-center">
			<div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
				<CheckCircle2 className="h-8 w-8" />
			</div>
			<DialogTitle className="text-2xl font-bold tracking-tight">
				{t('waitlist.successTitle')}
			</DialogTitle>
			<DialogDescription className="mt-3 max-w-sm text-base leading-relaxed">
				{t('waitlist.successDescription')}
			</DialogDescription>
			<Button
				className="gradient-btn mt-8 min-w-40 text-white"
				onClick={onClose}
			>
				{t('waitlist.actions.close')}
			</Button>
		</div>
	)
}

function WaitlistStepActions({
	onBack,
	onPrimary,
	primaryLabel,
	primaryType = 'submit',
	isPending = false,
	showBack = true,
	secondaryAction,
}: {
	onBack?: () => void
	onPrimary?: () => void
	primaryLabel: string
	primaryType?: 'button' | 'submit'
	isPending?: boolean
	showBack?: boolean
	secondaryAction?: ReactNode
}) {
	const { t } = useI18n()

	return (
		<div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-2">
				{showBack && onBack ? (
					<Button type="button" variant="ghost" onClick={onBack}>
						{t('waitlist.actions.back')}
					</Button>
				) : null}
				{secondaryAction}
			</div>
			<Button
				type={primaryType}
				className="gradient-btn min-w-36 text-white"
				disabled={isPending}
				onClick={onPrimary}
			>
				{isPending ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						{t('waitlist.actions.submitting')}
					</>
				) : (
					primaryLabel
				)}
			</Button>
		</div>
	)
}

function StepOne({ onNext }: { onNext: () => void }) {
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

function StepTwo({
	onNext,
	onBack,
}: {
	onNext: () => void
	onBack: () => void
}) {
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
									<Input
										placeholder={t('waitlist.fields.projectNamePlaceholder')}
										{...field}
									/>
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
										placeholder={t(
											'waitlist.fields.projectDescriptionPlaceholder',
										)}
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
									<Input
										placeholder={t('waitlist.fields.locationPlaceholder')}
										{...field}
									/>
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

function WaitlistReviewSummary() {
	const { t } = useI18n()
	const { formData } = useWaitlist()

	const roleLabel = ROLE_OPTIONS.find((role) => role.value === formData.role)

	return (
		<div className="rounded-xl border border-slate-200 bg-[#fafbfc] p-4">
			<p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
				{t('waitlist.reviewTitle')}
			</p>
			<dl className="space-y-3 text-sm">
				<div className="flex items-start justify-between gap-4">
					<dt className="text-muted-foreground">{t('waitlist.fields.name')}</dt>
					<dd className="text-right font-medium text-slate-900">
						{formData.name}
					</dd>
				</div>
				{formData.email ? (
					<div className="flex items-start justify-between gap-4">
						<dt className="text-muted-foreground">
							{t('waitlist.fields.email')}
						</dt>
						<dd className="text-right font-medium text-slate-900">
							{formData.email}
						</dd>
					</div>
				) : null}
				<div className="flex items-start justify-between gap-4">
					<dt className="text-muted-foreground">{t('waitlist.fields.role')}</dt>
					<dd className="text-right font-medium text-slate-900">
						{roleLabel ? t(roleLabel.labelKey) : formData.role}
					</dd>
				</div>
				{formData.projectName ? (
					<div className="flex items-start justify-between gap-4">
						<dt className="text-muted-foreground">
							{t('waitlist.fields.projectName')}
						</dt>
						<dd className="text-right font-medium text-slate-900">
							{formData.projectName}
						</dd>
					</div>
				) : null}
				{formData.location ? (
					<div className="flex items-start justify-between gap-4">
						<dt className="text-muted-foreground">
							{t('waitlist.fields.location')}
						</dt>
						<dd className="text-right font-medium text-slate-900">
							{formData.location}
						</dd>
					</div>
				) : null}
			</dl>
		</div>
	)
}

function StepThree({
	onBack,
	onSubmit,
	isPending = false,
}: {
	onBack: () => void
	onSubmit: (data: WaitlistStepThreeData) => void
	isPending?: boolean
}) {
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
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-5"
					>
						<FormField
							control={form.control}
							name="source"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('waitlist.fields.source')}</FormLabel>
									<FormControl>
										<Input
											placeholder={t('waitlist.fields.sourcePlaceholder')}
											{...field}
										/>
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
