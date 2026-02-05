'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, Check, ChevronLeft, Loader2 } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { FoundationSelect } from '~/components/sections/projects/create/foundation-select'
import { LocationSelect } from '~/components/sections/projects/create/location-select'
import { TagInput } from '~/components/sections/projects/create/tag-input'
import { CategoryBadge } from '~/components/sections/projects/shared'
import { useCreateProject } from '~/hooks/contexts/use-create-project.context'
import { getAllCategories } from '~/lib/queries/projects'
import { stepThreeSchema } from '~/lib/schemas/create-project.schemas'
import type { StepThreeData } from '~/lib/types/project/create-project.types'
import { CategoryBadgeSkeleton } from '../../skeletons'

interface StepThreeProps {
	onBack: () => void
	onSubmit: (data: StepThreeData) => void
	isPending?: boolean
}

export function StepThree({
	onBack,
	onSubmit,
	isPending = false,
}: StepThreeProps) {
	const { formData, updateFormData } = useCreateProject()
	const prefersReducedMotion = useReducedMotion()

	const {
		data: categories = [],
		isLoading,
		error: categoriesError,
	} = useSupabaseQuery('categories', getAllCategories, {
		staleTime: 1000 * 60 * 60, // 1 hour
		gcTime: 1000 * 60 * 60, // 1 hour
	})

	const form = useForm<StepThreeData>({
		resolver: zodResolver(stepThreeSchema),
		defaultValues: {
			location: formData.location,
			category: formData.category,
			foundationId: (formData as { foundationId?: string }).foundationId || '',
			tags: formData.tags,
		},
		mode: 'onBlur', // Validate on blur for better UX
	})

	// Memoize category selection handler to prevent unnecessary re-renders
	const handleCategorySelect = useCallback(
		(
			categoryId: string,
			currentValue: string,
			onChange: (value: string) => void,
		) => {
			if (categoryId !== currentValue) {
				onChange(categoryId)
			}
		},
		[],
	)

	const handlePrevious = useCallback(() => {
		const data = form.getValues()
		updateFormData({
			...data,
			tags: data.tags || [],
		})
		onBack()
	}, [form, updateFormData, onBack])

	const handleSubmit = useCallback(
		(data: StepThreeData) => {
			onSubmit(data)
		},
		[onSubmit],
	)

	// Animation variants with reduced motion support
	const motionVariants = useMemo(
		() => ({
			initial: { opacity: 0, x: prefersReducedMotion ? 0 : 50 },
			animate: { opacity: 1, x: 0 },
			exit: { opacity: 0, x: prefersReducedMotion ? 0 : -50 },
			transition: { duration: prefersReducedMotion ? 0 : 0.3 },
		}),
		[prefersReducedMotion],
	)

	const isFormValid = form.formState.isValid
	const hasErrors = Object.keys(form.formState.errors).length > 0

	return (
		<motion.div {...motionVariants}>
			<Card className="bg-white">
				<CardContent className="pt-6">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-8"
							noValidate
							aria-label="Project details form"
						>
							{/* Location Field */}
							<FormField
								control={form.control}
								name="location"
								render={({ field }) => (
									<FormItem className="flex flex-col space-y-2">
										<FormLabel htmlFor="location-select">
											Where is your project based?{' '}
											<span className="text-destructive" aria-hidden="true">
												*
											</span>
										</FormLabel>
										<FormControl>
											<LocationSelect
												value={field.value}
												onChange={field.onChange}
											/>
										</FormControl>
										<FormMessage />
										<p className="text-sm text-muted-foreground">
											Select the primary country or region where your project
											operates.
										</p>
									</FormItem>
								)}
							/>

							{/* Category Field */}
							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel>
											How would you categorize your project?{' '}
											<span className="text-destructive" aria-hidden="true">
												*
											</span>
										</FormLabel>
										<FormControl>
											<fieldset className="mt-4 border-0 p-0">
												<legend className="sr-only">Project categories</legend>
												{isLoading ? (
													<div
														className="flex flex-wrap gap-2"
														aria-live="polite"
														aria-busy="true"
													>
														<span className="sr-only">Loading categories…</span>
														{Array.from({ length: 12 }).map((_, i) => (
															// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
															<CategoryBadgeSkeleton key={i} />
														))}
													</div>
												) : categoriesError ? (
													<div
														className="flex w-full items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4"
														role="alert"
														aria-live="assertive"
													>
														<AlertCircle
															className="h-5 w-5 shrink-0 text-destructive"
															aria-hidden="true"
														/>
														<div className="flex-1">
															<p className="text-sm font-medium text-destructive">
																Failed to load categories
															</p>
															<p className="mt-1 text-sm text-destructive/80">
																Please refresh the page or try again later.
															</p>
														</div>
													</div>
												) : categories.length === 0 ? (
													<p className="text-sm text-muted-foreground">
														No categories available at this time.
													</p>
												) : (
													<div className="flex flex-wrap gap-2">
														{categories.map((category) => (
															<CategoryBadge
																key={category.id}
																category={category}
																selected={field.value === category.id}
																onClick={() =>
																	handleCategorySelect(
																		category.id,
																		field.value,
																		field.onChange,
																	)
																}
															/>
														))}
													</div>
												)}
											</fieldset>
										</FormControl>
										<FormMessage />
										{!isLoading &&
											!categoriesError &&
											categories.length > 0 && (
												<p className="text-sm text-muted-foreground">
													Choose the category that best describes your
													project&apos;s primary focus.
												</p>
											)}
									</FormItem>
								)}
							/>

							{/* Foundation Field */}
							<FormField
								control={form.control}
								name="foundationId"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel>
											Assign to Foundation{' '}
											<span className="text-muted-foreground font-normal">
												(optional)
											</span>
										</FormLabel>
										<FormControl>
											<FoundationSelect
												value={field.value || ''}
												onChange={(value) => field.onChange(value || undefined)}
											/>
										</FormControl>
										<FormMessage />
										<p className="text-sm text-muted-foreground">
											If this campaign is part of a foundation, select it here.
											This helps build trust and organize your campaigns.
										</p>
									</FormItem>
								)}
							/>

							{/* Tags Field */}
							<FormField
								control={form.control}
								name="tags"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel>
											Add relevant keywords to describe your project{' '}
											<span className="text-muted-foreground font-normal">
												(optional)
											</span>
										</FormLabel>
										<FormControl>
											<TagInput
												tags={field.value || []}
												onChange={field.onChange}
												error={form.formState.errors.tags?.message}
												placeholder="Enter a tag…"
											/>
										</FormControl>
										<FormMessage />
										<p className="text-sm text-muted-foreground">
											Add up to 10 tags to help people discover your project.
											Press Enter to add a tag.
										</p>
									</FormItem>
								)}
							/>

							{/* Form Actions */}
							<fieldset className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between sm:items-center border-0 p-0">
								<legend className="sr-only">Form actions</legend>
								<Button
									type="button"
									variant="outline"
									onClick={handlePrevious}
									disabled={isPending}
									className="flex items-center justify-center gap-2 gradient-border-btn bg-white w-full sm:w-auto touch-manipulation"
									aria-label="Go back to previous step"
								>
									<ChevronLeft className="h-4 w-4" aria-hidden="true" />
									Previous
								</Button>

								<Button
									type="submit"
									disabled={!isFormValid || isPending || hasErrors}
									className="flex items-center justify-center gap-2 gradient-btn text-white w-full sm:w-auto touch-manipulation focus-visible:ring-2 focus-visible:ring-offset-2"
									aria-label={
										isPending
											? 'Submitting project…'
											: isFormValid
												? 'Submit project for review'
												: 'Complete required fields to submit'
									}
								>
									{isPending ? (
										<>
											<Loader2
												className="h-4 w-4 animate-spin"
												aria-hidden="true"
											/>
											<span>Submitting…</span>
										</>
									) : (
										<>
											<span>Submit for Review</span>
											<Check className="h-4 w-4" aria-hidden="true" />
										</>
									)}
								</Button>
							</fieldset>

							{/* Validation Summary */}
							{hasErrors && !isPending && (
								<div
									className="rounded-lg border border-amber-200 bg-amber-50 p-4"
									role="alert"
									aria-live="polite"
								>
									<div className="flex items-start gap-2">
										<AlertCircle
											className="h-5 w-5 shrink-0 text-amber-600"
											aria-hidden="true"
										/>
										<div className="flex-1">
											<p className="text-sm font-medium text-amber-900">
												Please complete all required fields
											</p>
											<p className="mt-1 text-sm text-amber-800">
												Check the fields above for validation errors.
											</p>
										</div>
									</div>
								</div>
							)}
						</form>
					</Form>
				</CardContent>
			</Card>
		</motion.div>
	)
}
