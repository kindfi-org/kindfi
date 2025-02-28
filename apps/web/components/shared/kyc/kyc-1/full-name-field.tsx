import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { Input } from '~/components/base/input'
import type { FormFieldProps } from './types'

export function FullNameField({ control }: FormFieldProps) {
	return (
		<FormField
			control={control}
			name="fullName"
			render={({ field }) => (
				<FormItem>
					<FormLabel className="text-lg font-medium">Full Legal Name</FormLabel>
					<FormControl>
						<Input
							placeholder="Enter your full name"
							{...field}
							className="w-full"
						/>
					</FormControl>
					<p className="text-sm text-gray-500 mt-1">
						This should match your government-issued ID
					</p>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
