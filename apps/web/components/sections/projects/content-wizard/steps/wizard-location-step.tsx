'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { AlertCircle } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { CategoryBadgeSkeleton } from '~/components/sections/projects/skeletons'
import { useContentWizard } from '~/hooks/contexts/use-content-wizard.context'
import { zodResolver } from '~/lib/form/zod-resolver'
import { useI18n } from '~/lib/i18n/context'
import { getAllCategories } from '~/lib/queries/projects'
import { wizardLocationSchema } from '~/lib/schemas/content-wizard.schemas'
import type { StepThreeData } from '~/lib/types/project/create-project.types'
import { WizardStepShell } from '../wizard-step-shell'

type WizardLocationStepProps = {
	onContinue: (data: StepThreeData) => void | Promise<void>
	onBack: () => void
	isSaving?: boolean
}

export function WizardLocationStep({
	onContinue,
	onBack,
	isSaving = false,
}: WizardLocationStepProps) {
	const { t } = useI18n()
	const { formData, lockedFoundation } = useContentWizard()

	const {
		data: categories = [],
		isLoading,
		error: categoriesError,
	} = useSupabaseQuery('categories', getAllCategories, {
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60,
	})

	const form = useForm<StepThreeData>({
		resolver: zodResolver(wizardLocationSchema),
		defaultValues: {
			location: formData.location || '',
			category: formData.category || '',
			foundationId: lockedFoundation?.id ?? formData.foundationId ?? '',
			tags: formData.tags ?? [],
		},
	})

	useEffect(() => {
		if (lockedFoundation) {
			form.setValue('foundationId', lockedFoundation.id)
		}
	}, [lockedFoundation, form])

	const handleCategorySelect = useCallback(
		(categoryId: string, currentValue: string, onChange: (value: string) => void) => {
			if (categoryId !== currentValue) onChange(categoryId)
		},
		[],
	)

	return (
		<WizardStepShell
			title={t('projects.manage.contentWizard.stepLocation')}
			description={t('projects.manage.contentWizard.phaseSetup')}
			onBack={onBack}
			onContinue={form.handleSubmit((data) => onContinue({ ...data, tags: data.tags ?? [] }))}
			isSaving={isSaving}
		>
			<Form {...form}>
				<div className="space-y-6">
					<FormField
						control={form.control}
						name="location"
						render={({ field }) => (
							<FormItem>
								<FormLabel>
									Location <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<LocationSelect value={field.value} onChange={field.onChange} />
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
									Category <span className="text-destructive">*</span>
								</FormLabel>
								<FormControl>
									<div className="space-y-3">
										{isLoading ? (
											<div className="flex flex-wrap gap-2">
												{Array.from({ length: 6 }).map((_, i) => (
													// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
													<CategoryBadgeSkeleton key={i} />
												))}
											</div>
										) : categoriesError ? (
											<div className="flex items-center gap-2 text-destructive text-sm">
												<AlertCircle className="h-4 w-4" />
												Failed to load categories
											</div>
										) : (
											<div className="flex flex-wrap gap-2">
												{categories.map((category) => (
													<CategoryBadge
														key={category.id}
														category={category}
														selected={field.value === category.id}
														onClick={() =>
															handleCategorySelect(category.id, field.value, field.onChange)
														}
													/>
												))}
											</div>
										)}
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="foundationId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Foundation (optional)</FormLabel>
								<FormControl>
									<FoundationSelect value={field.value ?? ''} onChange={field.onChange} />
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
								<FormLabel>Tags (optional)</FormLabel>
								<FormControl>
									<TagInput tags={field.value ?? []} onChange={field.onChange} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</Form>
		</WizardStepShell>
	)
}
