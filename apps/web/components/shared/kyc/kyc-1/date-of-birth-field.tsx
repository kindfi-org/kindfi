import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Calendar } from '~/components/base/calendar'
import {
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/base/popover'
import { cn } from '~/lib/utils'
import type { FormFieldProps } from './types'

export function DateOfBirthField({ control }: FormFieldProps) {
	const formatDate = (date: Date) => {
		try {
			return format(date, 'PPP')
		} catch (error) {
			return 'Invalid date'
		}
	}

	return (
		<FormField
			control={control}
			name="dateOfBirth"
			render={({ field }) => (
				<FormItem>
					<FormLabel className="text-lg font-medium">Date of Birth</FormLabel>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									'w-full justify-start text-left font-normal',
									!field.value && 'text-muted-foreground',
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{field.value ? formatDate(field.value) : 'Pick a date'}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
							<Calendar
								mode="single"
								selected={field.value}
								onSelect={field.onChange}
								disabled={(date) => {
									const today = new Date()
									const eighteenYearsAgo = new Date(
										today.getFullYear() - 18,
										today.getMonth(),
										today.getDate(),
									)
									return date > eighteenYearsAgo
								}}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
					<p className="text-sm text-gray-500 mt-1">
						You must be at least 18 years old
					</p>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
