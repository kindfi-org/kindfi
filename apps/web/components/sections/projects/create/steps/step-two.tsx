'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
import { Input } from '~/components/base/input'
import { ImageUpload } from '~/components/sections/projects/create/image-upload'
import { SocialLinks } from '~/components/sections/projects/create/social-links'
import { useCreateProject } from '~/hooks/contexts/use-create-project.context'
import { stepTwoSchema } from '~/lib/schemas/create-project.schemas'
import type { StepTwoData } from '~/lib/types/project/create-project.types'

interface StepTwoProps {
	onNext: () => void
	onBack: () => void
}

export function StepTwo({ onNext, onBack }: StepTwoProps) {
	const { formData, updateFormData } = useCreateProject()

	const form = useForm<StepTwoData>({
		resolver: zodResolver(stepTwoSchema),
		defaultValues: {
			image: formData.image ?? null,
			website: formData.website ?? '',
			socialLinks: formData.socialLinks ?? [],
		},
	})

	const handlePrevious = () => {
		const data = form.getValues()
		updateFormData({
			...data,
			socialLinks: data.socialLinks || [],
		})
		onBack()
	}

	const onSubmit = (data: StepTwoData) => {
		updateFormData({
			...data,
			socialLinks: data.socialLinks || [],
		})
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
								name="image"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Upload a project image</FormLabel>
										<FormControl>
											<ImageUpload
												value={field.value}
												onChange={field.onChange}
												error={
													form.formState.errors.image?.message as
														| string
														| undefined
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="website"
								render={({ field }) => (
									<FormItem>
										<FormLabel>What's your project's website?</FormLabel>
										<FormControl>
											<Input
												type="url"
												className="border-green-600 bg-white"
												placeholder="https://yourproject.com"
												value={field.value ?? ''}
												onChange={(e) => field.onChange(e.target.value)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="socialLinks"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Add any additional social links</FormLabel>
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

							<div className="flex justify-between">
								<Button
									type="button"
									variant="outline"
									onClick={handlePrevious}
									className="flex items-center gap-2 gradient-border-btn bg-white"
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
