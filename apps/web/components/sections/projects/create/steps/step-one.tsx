'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import {
	CSRFTokenField,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { Textarea } from '~/components/base/textarea'
import { useCreateProject } from '~/hooks/contexts/use-create-project.context'
import { stepOneSchema } from '~/lib/schemas/create-project.schemas'
import type { StepOneData } from '~/lib/types/project/create-project.types'

interface StepOneProps {
	onNext: () => void
}

export function StepOne({ onNext }: StepOneProps) {
	const { formData, updateFormData } = useCreateProject()

	const form = useForm<StepOneData>({
		resolver: zodResolver(stepOneSchema),
		defaultValues: {
			title: formData.title,
			description: formData.description,
			targetAmount: formData.targetAmount || undefined,
			minimumInvestment: formData.minimumInvestment || undefined,
		},
	})

	const onSubmit = (data: StepOneData) => {
		updateFormData(data)
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
							<CSRFTokenField />
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											What is your project&apos;s title?{' '}
											<span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter your project title"
												className="border-green-600 bg-white"
												{...field}
											/>
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
											Write a short description or tagline for your project{' '}
											<span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe your project in a few sentences"
												className="min-h-[100px] border-green-600 bg-white"
												{...field}
											/>
										</FormControl>
										<p className="text-sm text-muted-foreground mt-2">
											Just a quick summary is fine for now. You will be able to
											edit it later.
										</p>
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
											How much funding are you aiming to raise?{' '}
											<span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
													<span className="text-gray-500 sm:text-sm">$</span>
												</div>
												<Input
													type="number"
													placeholder="50000"
													className="pl-7 border-green-600 bg-white"
													value={field.value ?? ''}
													onChange={(e) =>
														field.onChange(
															e.target.value === ''
																? undefined
																: Number(e.target.value),
														)
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
											What&apos;s the minimum amount someone can invest?{' '}
											<span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<div className="relative">
												<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
													<span className="text-gray-500 sm:text-sm">$</span>
												</div>
												<Input
													type="number"
													placeholder="100"
													className="pl-7 border-green-600 bg-white"
													value={field.value ?? ''}
													onChange={(e) =>
														field.onChange(
															e.target.value === ''
																? undefined
																: Number(e.target.value),
														)
													}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-between">
								<Button
									type="button"
									variant="outline"
									disabled
									className="flex items-center gap-2 gradient-border-btn bg-white"
									aria-label="Previous step (disabled on first step)"
								>
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>
								<Button
									type="submit"
									className="flex items-center gap-2 gradient-btn text-white"
								>
									Next
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</motion.div>
	)
}
