import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import { Button } from '~/components/base/button'
import {
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '~/components/base/form'
import { cn } from '~/lib/utils'
import type { FormFieldProps } from './types'
import 'react-datepicker/dist/react-datepicker.css'

export function DateOfBirthField({ control }: FormFieldProps) {
	const formatDate = (date: Date | undefined): string => {
		if (!date) return 'Select a date'
		if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
			console.error('Invalid date value:', date)
			return 'Invalid date'
		}
		try {
			return format(date, 'PPP') // Example: "Oct 25, 2023"
		} catch (error) {
			console.error('Error formatting date:', error)
			return 'Error in date'
		}
	}
	const today = new Date()
	const maxDate = new Date(today)
	maxDate.setFullYear(today.getFullYear() - 18)
	return (
		<FormField
			control={control}
			name="dateOfBirth"
			render={({ field }) => {
				const [selectedDate, setSelectedDate] = useState<Date | undefined>(
					field.value instanceof Date && !Number.isNaN(field.value.getTime())
						? field.value
						: undefined,
				)

				const handleDateChange = (date: Date | null) => {
					console.log('Date changed:', date)
					const validDate =
						date && !Number.isNaN(date.getTime()) ? date : undefined
					setSelectedDate(validDate)
					field.onChange(validDate)
				}

				const today = new Date()
				const maxDate = new Date(today)
				maxDate.setFullYear(today.getFullYear() - 18)

				return (
					<FormItem>
						<FormLabel className="text-lg font-medium">Date of Birth</FormLabel>
						<div className="relative">
							<DatePicker
								selected={selectedDate}
								onChange={handleDateChange}
								dateFormat="MMMM d, yyyy"
								maxDate={maxDate}
								showYearDropdown
								yearDropdownItemNumber={100}
								scrollableYearDropdown
								placeholderText="Select a date"
								className={cn(
									'w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
									!selectedDate && 'text-gray-400',
								)}
								customInput={
									<Button
										variant="outline"
										className={cn(
											'w-full justify-start text-left font-normal',
											!selectedDate && 'text-muted-foreground',
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{formatDate(selectedDate)}
									</Button>
								}
							/>
						</div>
						<p className="text-sm text-gray-500 mt-1">
							You must be at least 18 years old
						</p>
						<FormMessage />
					</FormItem>
				)
			}}
		/>
	)
}
