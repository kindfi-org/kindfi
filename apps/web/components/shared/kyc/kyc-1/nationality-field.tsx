import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { countries, type FormFieldProps } from './types'

export function NationalityField({ control }: FormFieldProps) {
	return (
		<FormField
			control={control}
			name="nationality"
			render={({ field }) => (
				<FormItem>
					<FormLabel className="text-lg font-medium">Nationality</FormLabel>
					<Select onValueChange={field.onChange} defaultValue={field.value}>
						<FormControl>
							<SelectTrigger>
								<SelectValue placeholder="Select your nationality" />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{countries.map((country) => (
								<SelectItem key={country} value={country}>
									{country}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-sm text-gray-500 mt-1">
						Select the country of your citizenship
					</p>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
