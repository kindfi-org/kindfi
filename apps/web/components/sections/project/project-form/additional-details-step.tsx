import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ProjectFormData } from '~/lib/validators/project'

type AdditionalDetailsProps = {
	register: UseFormRegister<ProjectFormData>
	errors: FieldErrors<ProjectFormData>
}

export function AdditionalDetails({
	register,
	errors,
}: AdditionalDetailsProps) {
	return (
		<div className="space-y-4">
			<div>
				<label
					htmlFor="projectSupport"
					className="block text-sm font-medium text-red-500 mb-1.5"
				>
					Why should people support your project?
				</label>
				<textarea
					id="projectSupport"
					{...register('projectSupport')}
					placeholder="Tell us about your project's mission and impact..."
					rows={4}
					className={`w-full px-3 py-2 rounded-md border ${
						errors.projectSupport ? 'border-red-500' : 'border-gray-200'
					} placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 resize-none`}
				/>
				{errors.projectSupport ? (
					<p className="text-sm text-red-500 mt-1">
						{errors.projectSupport.message}
					</p>
				) : (
					<p className="text-sm text-red-500 mt-1.5">
						Long description must be at least 20 characters.
					</p>
				)}
			</div>

			<div>
				<label
					htmlFor="fundUsage"
					className="block text-sm font-medium text-red-500 mb-1.5"
				>
					How will the funds be used?
				</label>
				<textarea
					id="fundUsage"
					{...register('fundUsage')}
					placeholder="Provide a detailed breakdown of fund allocation..."
					rows={4}
					className={`w-full px-3 py-2 rounded-md border ${
						errors.fundUsage ? 'border-red-500' : 'border-gray-200'
					} placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 resize-none`}
				/>
				{errors.fundUsage ? (
					<p className="text-sm text-red-500 mt-1">
						{errors.fundUsage.message}
					</p>
				) : (
					<p className="text-sm text-red-500 mt-1.5">
						Fund usage must be at least 20 characters.
					</p>
				)}
			</div>
		</div>
	)
}
