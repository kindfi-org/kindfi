'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion } from 'framer-motion'
import { Loader2, Save } from 'lucide-react'
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
import { ImageUpload } from '~/components/sections/projects/create/image-upload'
import { LocationSelect } from '~/components/sections/projects/create/location-select'
import { SocialLinks } from '~/components/sections/projects/create/social-links'
import { TagInput } from '~/components/sections/projects/create/tag-input'
import { CategoryBadge } from '~/components/sections/projects/shared'
import { useProjectMutation } from '~/hooks/projects/use-project-mutation'
import { getAllCategories } from '~/lib/queries/projects'
import {
	stepOneSchema,
	stepThreeSchema,
	stepTwoSchema,
} from '~/lib/schemas/create-project.schemas'
import type {
	BasicProjectInfo,
	CreateProjectFormData,
} from '~/lib/types/project/create-project.types'
import { normalizeProjectToFormDefaults } from '~/lib/utils/project-utils'
import { CategoryBadgeSkeleton } from '../skeletons'

// Combine all schemas for the complete form
const updateProjectSchema = stepOneSchema
	.and(stepTwoSchema)
	.and(stepThreeSchema)

interface UpdateProjectFormProps {
	project: BasicProjectInfo
}

export function UpdateProjectForm({ project }: UpdateProjectFormProps) {
	const { mutateAsync: updateProject, isPending } = useProjectMutation({
		projectId: project.id,
	})

	const {
		data: categories = [],
		isLoading,
		error: categoryError,
	} = useSupabaseQuery('categories', getAllCategories, {
		staleTime: 1000 * 60 * 60, // 1 hour
		gcTime: 1000 * 60 * 60, // 1 hour
	})

	const form = useForm<CreateProjectFormData>({
		resolver: zodResolver(updateProjectSchema),
		defaultValues: normalizeProjectToFormDefaults(project),
	})

	const onSubmit = async (data: CreateProjectFormData) => {
		if (project.slug) {
			data.slug = project.slug
		}
		console.log('Updating project:', data)
		await updateProject(data, {
			onSuccess: () => {
				form.reset(data)
			},
		})
	}

	const isDirty = form.formState.isDirty

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="max-w-2xl mx-auto">
				<Card className="bg-white">
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="max-w-2xl mx-auto space-y-6"
							>
								<CSRFTokenField />
								{/* Title */}
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Title</FormLabel>
											<FormControl>
												<Input
													placeholder="Enter your project title"
													className="bg-white border-green-600"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Description */}
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Describe your project in a few sentences"
													className="min-h-[120px] border-green-600 bg-white"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Target Amount */}
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<FormField
										control={form.control}
										name="targetAmount"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Target Amount</FormLabel>
												<FormControl>
													<div className="relative">
														<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
															<span className="text-gray-500 sm:text-sm">
																$
															</span>
														</div>
														<Input
															type="number"
															placeholder="50000"
															className="bg-white border-green-600 pl-7"
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

									{/* Minimum Investment */}
									<FormField
										control={form.control}
										name="minimumInvestment"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Minimum Investment</FormLabel>
												<FormControl>
													<div className="relative">
														<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
															<span className="text-gray-500 sm:text-sm">
																$
															</span>
														</div>
														<Input
															type="number"
															placeholder="100"
															className="bg-white border-green-600 pl-7"
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
								</div>

								{/* Website */}
								<FormField
									control={form.control}
									name="website"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Website</FormLabel>
											<FormControl>
												<Input
													type="url"
													placeholder="https://yourproject.com"
													className="bg-white border-green-600"
													value={field.value ?? ''}
													onChange={(e) => field.onChange(e.target.value)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Social Links */}
								<FormField
									control={form.control}
									name="socialLinks"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Social Links</FormLabel>
											<FormControl>
												<SocialLinks
													value={field.value ?? []}
													onChange={field.onChange}
													error={form.formState.errors.socialLinks?.message}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Project Image */}
								<FormField
									control={form.control}
									name="image"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Project Image</FormLabel>
											<FormControl>
												<ImageUpload
													value={field.value}
													onChange={field.onChange}
													error={form.formState.errors.image?.message}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Location */}
								<FormField
									control={form.control}
									name="location"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Location</FormLabel>
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

								{/* Category */}
								<FormField
									control={form.control}
									name="category"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category</FormLabel>
											<FormControl>
												<div className="mt-8 flex flex-wrap gap-2">
													{isLoading ? (
														<div className="flex flex-wrap gap-2">
															{Array.from({ length: 12 }).map((_, i) => (
																// biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable here
																<CategoryBadgeSkeleton key={i} />
															))}
														</div>
													) : categoryError ? (
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

								{/* Tags */}
								<FormField
									control={form.control}
									name="tags"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Tags</FormLabel>
											<FormControl>
												<TagInput
													value={field.value || []}
													onChange={field.onChange}
													error={form.formState.errors.tags?.message}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Save Button Section */}
								<div className="pt-6 border-t border-gray-200">
									<div className="space-y-4 text-center">
										<div className="text-sm text-muted-foreground">
											{isDirty ? (
												<span className="font-medium text-amber-600">
													You have unsaved changes
												</span>
											) : (
												<span>All changes saved</span>
											)}
										</div>

										<Button
											type="submit"
											disabled={!isDirty || isPending}
											className="flex items-center w-full gap-2 px-8 text-white gradient-btn"
											size="lg"
											aria-describedby={
												isDirty ? 'unsaved-changes' : 'all-saved'
											}
											aria-label="Save changes"
										>
											{isPending ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin" />
													Saving...
												</>
											) : (
												<>
													<Save className="w-4 h-4" />
													Save Changes
												</>
											)}
										</Button>
									</div>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</motion.div>
	)
}
