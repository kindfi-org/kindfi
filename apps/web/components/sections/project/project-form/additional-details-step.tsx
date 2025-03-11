import type { Control } from 'react-hook-form'
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Textarea } from '~/components/base/textarea'
import type { ProjectFormData } from '~/lib/validators/project'

type AdditionalDetailsProps = {
	control: Control<ProjectFormData>
}

export function AdditionalDetails({ control }: AdditionalDetailsProps) {
	return (
		<div className="space-y-4">
			<FormField
				control={control}
				name="projectSupport"
				render={({ field }) => (
					<FormItem>
						<FormLabel> Why should people support your project?</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								id="projectSupport"
								placeholder="Tell us about your project's mission and impact..."
								rows={4}
								className="focus-visible:ring-2 focus-visible:ring-offset-2 resize-none"
							/>
						</FormControl>
						{field.value ? (
							<FormMessage className="font-bold gradient-text" />
						) : (
							<p className="text-sm gradient-text font-bold">
								Long description must be at least 20 characters.
							</p>
						)}
					</FormItem>
				)}
			/>

			<FormField
				control={control}
				name="fundUsage"
				render={({ field }) => (
					<FormItem>
						<FormLabel> How will the funds be used?</FormLabel>
						<FormControl>
							<Textarea
								{...field}
								id="projectSupport"
								placeholder="Provide a detailed breakdown of fund allocation..."
								rows={4}
								className="focus-visible:ring-2 focus-visible:ring-offset-2 resize-none"
							/>
						</FormControl>
						{field.value ? (
							<FormMessage className="font-bold gradient-text " />
						) : (
							<p className="text-sm gradient-text font-bold">
								Fund usage must be at least 20 characters.
							</p>
						)}
					</FormItem>
				)}
			/>
		</div>
	)
}
