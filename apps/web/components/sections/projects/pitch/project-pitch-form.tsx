'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Save, Video } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import {
	CSRFTokenField,
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { projectPitchSchema } from '~/lib/schemas/create-project.schemas'
import type { ProjectPitch } from '~/lib/types/project/project-detail.types'
import { FileUpload } from './file-upload'
import { MarkdownEditor } from './markdown-editor'

interface ProjectPitchFormProps {
	pitch: ProjectPitch
}

export function ProjectPitchForm({ pitch }: ProjectPitchFormProps) {
	const form = useForm<ProjectPitch>({
		resolver: zodResolver(projectPitchSchema),
		defaultValues: {
			title: pitch?.title || '',
			story: pitch?.story || '',
			pitchDeck: pitch?.pitchDeck || null,
			videoUrl: pitch?.videoUrl || '',
		},
		mode: 'onChange',
	})

	const handleSubmit = (data: ProjectPitch) => {
		console.log('Pitch data:', data)

		toast.success('Pitch saved successfully!', {
			description: 'Your project pitch has been updated.',
		})
	}

	const isFormValid = form.formState.isValid
	const isDirty = form.formState.isDirty

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5, delay: 0.1 }}
		>
			<Card className="bg-white max-w-5xl w-full">
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="w-full space-y-6"
						>
							<CSRFTokenField />
							{/* Title */}
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="pt-2">Title *</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													placeholder="Enter your pitch title"
													maxLength={100}
													className="bg-white border-green-600"
													{...field}
												/>
												<div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
													{field.value.length}/100
												</div>
											</div>
										</FormControl>
										<FormDescription>
											A clear, compelling title that captures your project's
											essence
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Story */}
							<FormField
								control={form.control}
								name="story"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Story *</FormLabel>
										<FormControl>
											<MarkdownEditor
												value={field.value}
												onChange={field.onChange}
												placeholder={`# Your Project Story

## The Problem
Describe the problem you're solving...

## Our Solution
Explain how your project addresses this problem...

## Expected Impact
Share the positive change you'll create...

## Why Support Us
Tell supporters why they should believe in your mission...`}
												error={form.formState.errors.story?.message}
											/>
										</FormControl>
										<FormDescription>
											Tell your story using Markdown. Explain the problem, your
											solution, and the impact you'll create.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Pitch Deck Upload */}
							<FormField
								control={form.control}
								name="pitchDeck"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pitch Deck (Optional)</FormLabel>
										<FormControl>
											<FileUpload
												value={field.value}
												onChange={field.onChange}
												error={
													typeof form.formState.errors.pitchDeck?.message ===
													'string'
														? form.formState.errors.pitchDeck?.message
														: undefined
												}
												label="Upload your pitch deck"
											/>
										</FormControl>
										<FormDescription>
											Upload a presentation that supports your pitch
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Video URL */}
							<FormField
								control={form.control}
								name="videoUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Video URL (Optional)</FormLabel>
										<FormControl>
											<div className="relative">
												<Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
												<Input
													placeholder="Enter YouTube or Vimeo URL"
													className="pl-10 bg-white border-green-600"
													value={field.value ?? ''}
													onChange={field.onChange}
													onBlur={field.onBlur}
													name={field.name}
													ref={field.ref}
												/>
											</div>
										</FormControl>
										<FormDescription>
											Add a YouTube or Vimeo video to make your pitch more
											engaging
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Submit Button */}
							<div className="pt-6 border-t border-gray-200">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
										disabled={!isFormValid || !isDirty}
										className="flex items-center gap-2 px-8 text-white gradient-btn"
										size="lg"
									>
										<Save className="h-4 w-4" />
										Save Changes
									</Button>
								</div>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</motion.div>
	)
}
