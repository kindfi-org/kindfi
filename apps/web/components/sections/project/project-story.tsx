'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Card } from '~/components/base/card'
import { Input } from '~/components/base/input'
import { RichTextEditor } from '~/components/sections/project/rich-text-editor'
import { type ProjectStory, projectStorySchema } from '~/lib/validators/project'

interface ProjectStoryFormProps {
	onSubmit: (data: ProjectStory) => void
	initialData?: Partial<ProjectStory>
}

export function ProjectStoryForm({
	onSubmit,
	initialData,
}: ProjectStoryFormProps) {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<ProjectStory>({
		resolver: zodResolver(projectStorySchema),
		defaultValues: {
			title: initialData?.title || '',
			story: initialData?.story || '',
		},
	})

	const title = watch('title')

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
				<h3 className="text-xl font-semibold mb-4">Project Story</h3>
				<div className="space-y-4">
					<div>
						<Input
							{...register('title')}
							placeholder="Enter compelling title for your project"
							className="w-full"
						/>
						<div className="flex justify-between mt-1">
							{errors.title && (
								<p className="text-sm text-red-500">{errors.title.message}</p>
							)}
							<p className="text-sm text-gray-500">
								{title?.length || 0}/100 characters
							</p>
						</div>
					</div>
					<div>
						<RichTextEditor
							content={initialData?.story || ''}
							onChange={(content) => setValue('story', content)}
						/>
						{errors.story && (
							<p className="text-sm text-red-500 mt-1">
								{errors.story.message}
							</p>
						)}
					</div>
				</div>
			</Card>
		</form>
	)
}
