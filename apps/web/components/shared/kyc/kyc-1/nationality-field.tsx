import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/base/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '~/components/base/command'
import {
	FormControl,
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
import { countries, type FormFieldProps } from './types'

export function NationalityField({ control }: FormFieldProps) {
	const [open, setOpen] = useState(false)

	return (
		<FormField
			control={control}
			name="nationality"
			render={({ field }) => (
				<FormItem>
					<FormLabel className="text-lg font-medium">Nationality</FormLabel>
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={open}
									className="w-full justify-between font-normal"
								>
									{field.value
										? countries.find((country) => country === field.value)
										: 'Select your nationality...'}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</FormControl>
						</PopoverTrigger>
						<PopoverContent className="w-full p-0" align="start">
							<Command>
								<CommandInput placeholder="Search countries..." />
								<CommandList>
									<CommandEmpty>No country found.</CommandEmpty>
									<CommandGroup className="max-h-[300px] overflow-auto">
										{countries.map((country) => (
											<CommandItem
												key={country}
												value={country}
												onSelect={() => {
													field.onChange(country)
													setOpen(false)
												}}
												className="cursor-pointer"
											>
												<Check
													className={cn(
														'mr-2 h-4 w-4',
														field.value === country
															? 'opacity-100'
															: 'opacity-0',
													)}
												/>
												{country}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
					<p className="text-sm text-gray-500 mt-1">
						Select the country of your citizenship
					</p>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
