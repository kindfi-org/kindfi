'use client'

import { motion } from 'framer-motion'
import { Loader2, Save, Video } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import { ProjectOppositeLocaleTranslationCard } from '~/components/shared/project-opposite-locale-translation-card'
import { useProjectPitchMutation } from '~/hooks/projects/use-pitch-mutation'
import { zodResolver } from '~/lib/form/zod-resolver'
import { useI18n } from '~/lib/i18n/context'
import { projectPitchSchema } from '~/lib/schemas/create-project.schemas'
import type { ProjectPitchFormData } from '~/lib/types/project/create-project.types'
import { FileUpload } from './file-upload'

const RichTextEditor = dynamic(
	() => import('./rich-text-editor').then((mod) => mod.RichTextEditor),
	{
		ssr: false,
		loading: () => <div className="h-48 animate-pulse rounded-md bg-muted" />,
	},
)

interface ProjectPitchFormProps {
	projectId: string
	projectSlug: string
	sourceLocale?: 'en' | 'es'
	pitch?: (ProjectPitchFormData & { translation?: ProjectPitchFormData['translation'] }) | null
}

const projectPitchManageSchema = projectPitchSchema.and(
	z.object({
		translation: z
			.object({
				title: z.string().optional(),
				story: z.string().optional(),
			})
			.optional(),
	}),
)

export function ProjectPitchForm({
	projectId,
	projectSlug,
	sourceLocale = 'en',
	pitch,
}: ProjectPitchFormProps) {
	const { t } = useI18n()
	const { mutateAsync: savePitch, isPending } = useProjectPitchMutation()

	const form = useForm<ProjectPitchFormData>({
		resolver: zodResolver(projectPitchManageSchema),
		defaultValues: {
			title: pitch?.title || '',
			story: pitch?.story || '',
			pitchDeck: pitch?.pitchDeck || null,
			videoUrl: pitch?.videoUrl || null,
			translation: {
				title: pitch?.translation?.title ?? '',
				story: pitch?.translation?.story ?? '',
			},
		},
	})

	const handleSubmit = async (data: ProjectPitchFormData) => {
		const payload = {
			...data,
			projectId,
			projectSlug,
		}

		await savePitch(payload, {
			onSuccess: () => {
				form.reset(data)
			},
		})
	}

	const isDirty = form.formState.isDirty

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5, delay: 0.1 }}
		>
			<Card className=" max-w-5xl w-full">
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-6">
							<CSRFTokenField />
							{/* Title */}
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="pt-2">
											Title <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													placeholder="Enter your story title"
													maxLength={100}
													className=" pr-16"
													value={field.value ?? ''}
													onChange={field.onChange}
													onBlur={field.onBlur}
													name={field.name}
													ref={field.ref}
												/>
												<div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
													{(field.value ?? '').length}/100
												</div>
											</div>
										</FormControl>
										<FormDescription>
											A clear, compelling title that captures your project&apos;s essence
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
										<FormLabel>
											Story <span className="text-destructive">*</span>
										</FormLabel>
										<FormControl>
											<RichTextEditor
												value={field.value}
												onChange={field.onChange}
												error={form.formState.errors.story?.message}
											/>
										</FormControl>
										<FormDescription>
											Write your project story using the editor. Describe the problem, your proposed
											solution, and the positive impact you aim to achieve.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<ProjectOppositeLocaleTranslationCard sourceLocale={sourceLocale}>
								<FormField
									control={form.control}
									name="translation.title"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="pt-2">
												Title <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														placeholder="Enter the translated story title"
														maxLength={100}
														className=" pr-16"
														value={field.value ?? ''}
														onChange={field.onChange}
														onBlur={field.onBlur}
														name={field.name}
														ref={field.ref}
													/>
													<div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
														{(field.value ?? '').length}/100
													</div>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="translation.story"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Story <span className="text-destructive">*</span>
											</FormLabel>
											<FormControl>
												<RichTextEditor
													value={field.value ?? ''}
													onChange={field.onChange}
													error={form.formState.errors.translation?.story?.message}
												/>
											</FormControl>
											<FormDescription>
												{t('projects.manage.translationSectionDescription')}
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</ProjectOppositeLocaleTranslationCard>

							{/* Pitch Deck Upload */}
							<FormField
								control={form.control}
								name="pitchDeck"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pitch Deck (optional)</FormLabel>
										<FormControl>
											<FileUpload
												value={field.value}
												onChange={field.onChange}
												error={
													typeof form.formState.errors.pitchDeck?.message === 'string'
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
										<FormLabel>Video URL (optional)</FormLabel>
										<FormControl>
											<div className="relative">
												<Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
												<Input
													placeholder="YouTube, Vimeo, or Loom URL"
													className="pl-10"
													value={field.value ?? ''}
													onChange={field.onChange}
													onBlur={field.onBlur}
													name={field.name}
													ref={field.ref}
												/>
											</div>
										</FormControl>
										<FormDescription>
											Add a YouTube, Vimeo, or Loom video to make your pitch more engaging
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Actions */}
							<div className="pt-6 border-t border-gray-200 space-y-4">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div className="text-sm text-muted-foreground">
										{isDirty ? (
											<span className="text-amber-600 font-medium">You have unsaved changes</span>
										) : (
											<span>All changes saved</span>
										)}
									</div>

									<Button
										type="submit"
										disabled={!isDirty || isPending}
										className="flex items-center gap-2 px-8 text-white gradient-btn"
										size="lg"
										aria-label="Save changes"
									>
										{isPending ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
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
				</CardContent>
			</Card>
		</motion.div>
	)
}
