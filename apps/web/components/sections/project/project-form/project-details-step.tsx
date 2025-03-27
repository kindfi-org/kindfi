import type { Control } from 'react-hook-form'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import { CategoryTag } from '~/components/category/category-tag/category-tag'
import { PROJECT_CATEGORIES } from '~/lib/constants/project.constants'
import type { ProjectFormData } from '~/lib/validators/project'

type ProjectDetailsProps = {
	control: Control<ProjectFormData>
}

export function ProjectDetails({ control }: ProjectDetailsProps) {
	return (
		<div className="space-y-4">
			<FormField
				control={control}
				name="website"
				render={({ field }) => (
					<FormItem>
						<FormLabel>What&apos;s your project&apos;s website?</FormLabel>
						<FormControl>
							<Input {...field} placeholder="https://" />
						</FormControl>
						<FormMessage className="font-bold gradient-text" />
						<p className="text-sm text-gray-500 mt-1.5">
							Optional: Add your project website if you have one
						</p>
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name="location"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Where is your project based?</FormLabel>
						<FormControl>
							<Input {...field} placeholder="Enter location" />
						</FormControl>
						<FormMessage className="font-bold gradient-text" />
					</FormItem>
				)}
			/>

			<FormField
				name="category"
				control={control}
				render={({ field }) => (
					<FormItem>
						<FormLabel> How would you categorize your project?</FormLabel>
						<FormControl>
							<div className="flex flex-wrap gap-2 ">
								{PROJECT_CATEGORIES.map((category) => (
									<CategoryTag
										key={category.id}
										category={category}
										isActive={field.value === category.value}
										onClick={() => field.onChange(category.value)}
									/>
								))}
							</div>
						</FormControl>
						<FormMessage className="font-bold gradient-text" />
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name="description"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Describe your project in simple words</FormLabel>
						<FormControl>
							<Input
								{...field}
								placeholder="e.g., Providing clean water for rural communities"
							/>
						</FormControl>
						<FormMessage className="font-bold gradient-text" />
					</FormItem>
				)}
			/>
		</div>
	)
}
