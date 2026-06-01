'use client'

import type { Tables } from '@services/supabase'
import { useFormContext } from 'react-hook-form'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { LocationSelect } from '~/components/sections/projects/create/location-select'
import { TagInput } from '~/components/sections/projects/create/tag-input'
import { CategoryBadge } from '~/components/sections/projects/shared'
import type { CreateProjectFormData } from '~/lib/types/project/create-project.types'
import { CategoryBadgeSkeleton } from '../../skeletons'

type LocationCategoryTagsFieldsProps = {
	categories: Tables<'categories'>[]
	isLoading: boolean
	categoryError: Error | null
}

export function LocationCategoryTagsFields({
	categories,
	isLoading,
	categoryError,
}: LocationCategoryTagsFieldsProps) {
	const form = useFormContext<CreateProjectFormData>()

	return (
		<>
			<FormField
				control={form.control}
				name="location"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							Location <span className="text-destructive">*</span>
						</FormLabel>
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
							Category <span className="text-destructive">*</span>
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

			<FormField
				control={form.control}
				name="tags"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Tags (optional)</FormLabel>
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
		</>
	)
}
