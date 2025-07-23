'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Loader2, Save } from 'lucide-react'
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

import { useToast } from '~/components/base/toast'
import { ImageUpload } from '~/components/sections/projects/create/image-upload'
import { LocationSelect } from '~/components/sections/projects/create/location-select'
import { SocialLinks } from '~/components/sections/projects/create/social-links'
import { TagInput } from '~/components/sections/projects/create/tag-input'
import { CategoryBadge } from '~/components/sections/projects/shared'
import { categories } from '~/lib/mock-data/project/categories.mock'
import {
	stepOneSchema,
	stepThreeSchema,
	stepTwoSchema,
} from '~/lib/schemas/create-project.schemas'
import type { CreateProjectFormData } from '~/lib/types/project/create-project.types'

// Combine all schemas for the complete form
const updateProjectSchema = stepOneSchema
	.and(stepTwoSchema)
	.and(stepThreeSchema)

interface UpdateProjectFormProps {
	project: CreateProjectFormData
}

export function UpdateProjectForm({ project }: UpdateProjectFormProps) {
	const { toast } = useToast()

	const form = useForm<CreateProjectFormData>({
		resolver: zodResolver(updateProjectSchema),
		defaultValues: project,
	})

	const onSubmit = (data: CreateProjectFormData) => {
		console.log('Updating project:', project.slug, data)

		toast({
			title: 'Project updated successfully!',
			description: 'Your project information has been saved.',
		})
	}

	const isDirty = form.formState.isDirty
	const isSubmitting = form.formState.isSubmitting

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6 max-w-2xl mx-auto"
				>
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
										className="border-green-600 bg-white"
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
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<FormField
							control={form.control}
							name="targetAmount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Target Amount</FormLabel>
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

						{/* Minimum Investment */}
						<FormField
							control={form.control}
							name="minimumInvestment"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Minimum Investment</FormLabel>
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
										className="border-green-600 bg-white"
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
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
										{categories.map((category) => (
											<CategoryBadge
												key={category.id}
												category={category}
												selected={field.value === category.id}
												onClick={() => field.onChange(category.id)}
												className="justify-center"
											/>
										))}
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
						<div className="text-center space-y-4">
							<div className="text-sm text-muted-foreground">
								{isDirty ? (
									<span className="text-amber-600 font-medium">
										You have unsaved changes
									</span>
								) : (
									<span>All changes saved</span>
								)}
							</div>

							<Button
								type="submit"
								disabled={!isDirty || isSubmitting}
								className="flex items-center gap-2 px-8 gradient-btn text-white w-full"
								size="lg"
								aria-describedby={isDirty ? 'unsaved-changes' : 'all-saved'}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Save className="h-4 w-4" />
										Save Changes
									</>
								)}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</motion.div>
	)
}
