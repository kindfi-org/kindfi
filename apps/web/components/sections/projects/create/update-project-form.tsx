'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useSupabaseQuery } from '@packages/lib/hooks'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'

import { Card, CardContent } from '~/components/base/card'
import { CSRFTokenField, Form } from '~/components/base/form'
import { useProjectMutation } from '~/hooks/projects/use-project-mutation'
import { getAllCategories } from '~/lib/queries/projects'
import type {
	BasicProjectInfo,
	CreateProjectFormData,
} from '~/lib/types/project/create-project.types'
import { normalizeProjectToFormDefaults } from '~/lib/utils/project-utils'
import { BasicInfoFields } from './update-project-form/basic-info-fields'
import { FundingFields } from './update-project-form/funding-fields'
import { LinksAndMediaFields } from './update-project-form/links-and-media-fields'
import { LocationCategoryTagsFields } from './update-project-form/location-category-tags-fields'
import { SaveFooter } from './update-project-form/save-footer'
import { updateProjectSchema } from './update-project-form/schema'

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
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60,
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
								<BasicInfoFields />
								<FundingFields />
								<LinksAndMediaFields />
								<LocationCategoryTagsFields
									categories={categories}
									isLoading={isLoading}
									categoryError={categoryError}
								/>
								<SaveFooter isDirty={isDirty} isPending={isPending} />
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</motion.div>
	)
}
