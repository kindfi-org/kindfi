'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import { Dialog, DialogContent } from '~/components/base/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { Textarea } from '~/components/base/textarea'
import { useWaitlist } from '~/hooks/contexts/use-waitlist.context'
import { logger } from '~/lib'
import {
	waitlistStepOneSchema,
	waitlistStepThreeSchema,
	waitlistStepTwoSchema,
} from '~/lib/schemas/waitlist.schemas'
import type {
	WaitlistFormData,
	WaitlistStepOneData,
	WaitlistStepThreeData,
	WaitlistStepTwoData,
} from '~/lib/types/waitlist.types'

interface WaitlistModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
	const { currentStep, setCurrentStep, formData } = useWaitlist()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleNext = () => {
		if (currentStep < 3) setCurrentStep(currentStep + 1)
	}
	const handleBack = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1)
	}

	const StepperIndicator = () => {
		const steps = ['Your interest', 'Project (optional)', 'Consent']
		return (
			<div className="flex justify-center items-center mb-6">
				{steps.map((label, index) => {
					const stepNumber = index + 1
					const isActive = currentStep === stepNumber
					const isCompleted = currentStep > stepNumber
					return (
						<div key={label} className="flex items-center">
							<div
								className={`h-2 w-8 rounded-full mx-1 ${
									isActive
										? 'bg-blue-600'
										: isCompleted
											? 'bg-green-600'
											: 'bg-gray-200'
								}`}
							/>
						</div>
					)
				})}
			</div>
		)
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
						onSubmit={async (data) => {
							setIsSubmitting(true)
							try {
								const body: WaitlistFormData = { ...formData, ...data }
								const res = await fetch('/api/waitlist', {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify(body),
								})
								if (!res.ok) {
									const err = await res.json().catch(() => ({}) as unknown)
									const message = err?.error || 'Failed to submit interest'
									logger.error({
										eventType: 'Waitlist Submission Error',
										error: message,
										details: err,
									})
							
									throw new Error(message)
								}
								onOpenChange(false)
							} catch (_e) {
								logger.error({
									eventType: 'Waitlist Submission Error',
									error: _e instanceof Error ? _e.message : 'Unknown error',
									details: _e,
								})
								// Optionally, show a user-friendly error message here
							} finally {
								setIsSubmitting(false)
							}
						}}
						isPending={isSubmitting}
					/>
				)
			default:
				return <StepOne onNext={handleNext} />
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<StepperIndicator />
				<AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
			</DialogContent>
		</Dialog>
	)
}

function StepOne({ onNext }: { onNext: () => void }) {
	const { formData, updateFormData } = useWaitlist()
	const form = useForm<WaitlistStepOneData>({
		resolver: zodResolver(waitlistStepOneSchema),
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
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			transition={{ duration: 0.3 }}
		>
			<Card className="bg-white">
				<CardContent className="pt-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Your name *</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g. Maria Lopez"
												className="bg-white"
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
									<FormItem>
										<FormLabel>Email (optional)</FormLabel>
										<FormControl>
											<Input
												placeholder="you@example.com"
												className="bg-white"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>I am a *</FormLabel>
										<FormControl>
											<Select
												value={field.value}
												onValueChange={field.onChange}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select your role" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="project_creator">
														Project creator
													</SelectItem>
													<SelectItem value="supporter">Supporter</SelectItem>
													<SelectItem value="partner">Partner</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-end">
								<Button type="submit" className="min-w-28">
									Next <ChevronRight className="ml-2 w-4 h-4" />
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
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
	const { formData, updateFormData } = useWaitlist()
	const form = useForm<WaitlistStepTwoData>({
		resolver: zodResolver(waitlistStepTwoSchema),
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

	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			transition={{ duration: 0.3 }}
		>
			<Card className="bg-white">
				<CardContent className="pt-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="projectName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Project name (optional)</FormLabel>
										<FormControl>
											<Input
												placeholder="e.g. Agua Limpia en Lima"
												className="bg-white"
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
										<FormLabel>Brief description (optional)</FormLabel>
										<FormControl>
											<Textarea
												placeholder="What is the impact you want to create?"
												className="bg-white"
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
										<FormLabel>Location (optional)</FormLabel>
										<FormControl>
											<Input
												placeholder="City, Country"
												className="bg-white"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-between">
								<Button type="button" variant="outline" onClick={onBack}>
									<ChevronLeft className="mr-2 w-4 h-4" /> Back
								</Button>
								<Button type="submit" className="min-w-28">
									Next <ChevronRight className="ml-2 w-4 h-4" />
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</motion.div>
	)
}

function StepThree({
	onBack,
	onSubmit,
	isPending = false,
}: {
	onBack: () => void
	onSubmit: (d: WaitlistStepThreeData) => void
	isPending?: boolean
}) {
	const { formData, updateFormData } = useWaitlist()
	const form = useForm<WaitlistStepThreeData>({
		resolver: zodResolver(waitlistStepThreeSchema),
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
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			transition={{ duration: 0.3 }}
		>
			<Card className="bg-white">
				<CardContent className="pt-6">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-6"
						>
							<FormField
								control={form.control}
								name="source"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Where did you hear about KindFi? (optional)
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Twitter, Stellar, friend, etc."
												className="bg-white"
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
										<div className="flex gap-3 items-center">
											<input
												id="consent"
												type="checkbox"
												className="w-4 h-4"
												checked={field.value}
												onChange={(e) => field.onChange(e.target.checked)}
											/>
											<FormLabel htmlFor="consent">
												I agree to be contacted about KindFi updates
											</FormLabel>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex justify-between">
								<Button type="button" variant="outline" onClick={onBack}>
									<ChevronLeft className="mr-2 w-4 h-4" /> Back
								</Button>
								<Button type="submit" className="min-w-28" disabled={isPending}>
									{isPending ? (
										<>
											<Loader2 className="mr-2 w-4 h-4 animate-spin" />{' '}
											Submitting
										</>
									) : (
										'Submit'
									)}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</motion.div>
	)
}
