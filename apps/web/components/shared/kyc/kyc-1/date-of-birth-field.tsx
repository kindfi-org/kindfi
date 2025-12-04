import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { cn } from '~/lib/utils'
import type { FormFieldProps } from './types'

export function DateOfBirthField({ control }: FormFieldProps) {
	const [isOpen, setIsOpen] = useState(false)
	const formatDate = (date: Date) => {
		try {
			return format(date, 'PPP')
		} catch (_error) {
			return 'Invalid date'
		}
	}

	const today = new Date()
	const eighteenYearsAgo = today.getFullYear() - 18
	const minYear = 1900 // Reasonable minimum year
	const maxYear = eighteenYearsAgo

	// Generate years array
	const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i)
	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	]

	return (
		<FormField
			control={control}
			name="dateOfBirth"
			render={({ field }) => {
				const selectedDate = field.value
				const selectedYear = selectedDate?.getFullYear() ?? eighteenYearsAgo
				const selectedMonth = selectedDate?.getMonth() ?? today.getMonth()
				const selectedDay = selectedDate?.getDate() ?? 1

				const handleYearChange = (year: string) => {
					const newDate = new Date(
						Number.parseInt(year, 10),
						selectedMonth,
						Math.min(selectedDay, new Date(Number.parseInt(year, 10), selectedMonth + 1, 0).getDate()),
					)
					field.onChange(newDate)
				}

				const handleMonthChange = (month: string) => {
					const monthIndex = months.indexOf(month)
					const newDate = new Date(
						selectedYear,
						monthIndex,
						Math.min(selectedDay, new Date(selectedYear, monthIndex + 1, 0).getDate()),
					)
					field.onChange(newDate)
				}

				return (
					<FormItem>
						<FormLabel className="text-lg font-medium">Date of Birth</FormLabel>
						<div className="space-y-3">
							{/* Quick selectors for year and month */}
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Year
									</label>
									<Select
										value={selectedYear.toString()}
										onValueChange={handleYearChange}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select year" />
										</SelectTrigger>
										<SelectContent className="max-h-[200px]">
											{years.map((year) => (
												<SelectItem key={year} value={year.toString()}>
													{year}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-muted-foreground">
										Month
									</label>
									<Select
										value={months[selectedMonth]}
										onValueChange={handleMonthChange}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select month" />
										</SelectTrigger>
										<SelectContent>
											{months.map((month, index) => (
												<SelectItem key={month} value={month}>
													{month}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Calendar picker for day selection */}
							<Popover open={isOpen} onOpenChange={setIsOpen}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											'w-full justify-start text-left font-normal',
											!field.value && 'text-muted-foreground',
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{field.value ? formatDate(field.value) : 'Pick a day'}
									</Button>
								</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={field.value}
									onSelect={(date) => {
										if (date) {
											field.onChange(date)
											setIsOpen(false)
										}
									}}
									disabled={(date) => {
										const eighteenYearsAgoDate = new Date(
											today.getFullYear() - 18,
											today.getMonth(),
											today.getDate(),
										)
										return date > eighteenYearsAgoDate
									}}
								/>
							</PopoverContent>
							</Popover>
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
