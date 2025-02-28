import type {
	Control,
	Controller,
	FieldErrors,
	UseFormRegister,
} from 'react-hook-form'

import { CategoryTag } from '~/components/category/categoryTag/CategoryTag'
import { PROJECT_CATEGORIES } from '~/lib/constants/project.constants'
import type { ProjectFormData } from '~/lib/validators/project'

type ProjectDetailsProps = {
	register: UseFormRegister<ProjectFormData>
	control: Control<ProjectFormData>
	errors: FieldErrors<ProjectFormData>
	Controller: typeof Controller
}

export function ProjectDetails({
	register,
	control,
	errors,
	Controller,
}: ProjectDetailsProps) {
	return (
		<div className="space-y-4">
			<div>
				<label
					htmlFor="website"
					className="block text-sm font-medium text-gray-900 mb-1.5"
				>
					What&apos;s your project&apos;s website?
				</label>
				<input
					type="text"
					id="website"
					{...register('website')}
					placeholder="https://"
					className={`w-full px-3 py-2 rounded-md border ${
						errors.website ? 'border-red-500' : 'border-gray-200'
					} placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1`}
				/>
				{errors.website && (
					<p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
				)}
				<p className="text-sm text-gray-500 mt-1.5">
					Optional: Add your project website if you have one
				</p>
			</div>

			<div>
				<label
					htmlFor="location"
					className="block text-sm font-medium text-gray-900 mb-1.5"
				>
					Where is your project based?
				</label>
				<input
					type="text"
					id="location"
					{...register('location')}
					placeholder="Enter location"
					className={`w-full px-3 py-2 rounded-md border ${
						errors.location ? 'border-red-500' : 'border-gray-200'
					} placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1`}
				/>
				{errors.location && (
					<p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
				)}
			</div>

			<div>
				<label
					htmlFor="category"
					className="block text-sm font-medium text-gray-900 mb-1.5"
				>
					How would you categorize your project?
				</label>

				<Controller
					name="category"
					control={control}
					render={({ field }) => (
						<div className="mt-2">
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
							{errors.category && (
								<p className="text-sm text-red-500 mt-2">
									{errors.category.message}
								</p>
							)}
						</div>
					)}
				/>
			</div>

			<div>
				<label
					htmlFor="description"
					className="block text-sm font-medium text-gray-900 mb-1.5"
				>
					Describe your project in simple words
				</label>
				<input
					type="text"
					id="description"
					{...register('description')}
					placeholder="e.g., Providing clean water for rural communities"
					className={`w-full px-3 py-2 rounded-md border ${
						errors.description ? 'border-red-500' : 'border-gray-200'
					} placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1`}
				/>
				{errors.description && (
					<p className="text-sm text-red-500 mt-1">
						{errors.description.message}
					</p>
				)}
			</div>
		</div>
	)
}
