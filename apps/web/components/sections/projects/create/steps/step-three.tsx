'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion } from 'framer-motion'
import { Check, ChevronLeft } from 'lucide-react'
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

	const {
		data: categories = [],
		isLoading,
		error,
	} = useSupabaseQuery('categories', getAllCategories, {
		staleTime: 1000 * 60 * 60, // 1 hour
		gcTime: 1000 * 60 * 60, // 1 hour
	})

	const form = useForm<StepThreeData>({
		resolver: zodResolver(stepThreeSchema),
		defaultValues: {
			location: formData.location,
			category: formData.category,
			tags: formData.tags,
		},
	})

	const handlePrevious = () => {
		const data = form.getValues()
		updateFormData({
			...data,
			tags: data.tags || [],
		})
		onBack()
	}

	const handleSubmit = (data: StepThreeData) => {
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
								name="location"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Where is your project based? *</FormLabel>
										<FormControl>
											<LocationSelect
												value={field.value}
												onChange={field.onChange}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											How would you categorize your project? *
										</FormLabel>
										<FormControl>
											<div className="mt-8 flex flex-wrap gap-2">
												{isLoading ? (
													<div className="flex flex-wrap gap-2">
														{Array.from({ length: 12 }).map((_, i) => (
															// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
															<CategoryBadgeSkeleton key={i} />
														))}
													</div>
												) : error ? (
													<p className="text-sm text-destructive text-center w-full">
														Failed to load categories. Please try again later.
													</p>
												) : (
													categories.map((category) => (
														<CategoryBadge
															key={category.id}
															category={category}
															selected={field.value === category.id}
															onClick={() => field.onChange(category.id)}
														/>
													))
												)}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="tags"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Add relevant keywords to describe your project
										</FormLabel>
										<FormControl>
											<TagInput
												tags={field.value || []}
												onChange={field.onChange}
												error={form.formState.errors.tags?.message}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={handlePrevious}
									className="flex items-center justify-center gap-2 gradient-border-btn bg-white w-full sm:w-auto"
								>
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>

								<Button
									type="submit"
									disabled={!form.formState.isValid || isPending}
									className="flex items-center justify-center gap-2 gradient-btn text-white w-full sm:w-auto"
								>
									{isPending ? 'Submitting...' : 'Submit for Review'}
									{!isPending && <Check className="h-4 w-4" />}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</motion.div>
	)
}
