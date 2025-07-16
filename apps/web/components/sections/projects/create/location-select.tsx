'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'

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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/base/popover'
import { CountryFlag } from '~/components/sections/projects/shared'
import { cn } from '~/lib/utils'
import {
	findCountryByAlpha3,
	getCountryOptions,
} from '~/lib/utils/project-utils'

interface LocationSelectProps {
	value: string
	onChange: (value: string) => void
}

export function LocationSelect({ value, onChange }: LocationSelectProps) {
	const countryOptions = useMemo(() => getCountryOptions(), [])
	const [open, setOpen] = useState(false)
	const selected = findCountryByAlpha3(value)

	const handleSelect = (alpha3: string) => {
		onChange(alpha3)
		setOpen(false)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					aria-expanded={open}
					aria-label="Select a country"
					className={cn(
						'w-full justify-between border-green-600 bg-white text-sm font-medium text-gray-700 hover:text-gray-700',
						!selected && 'text-muted-foreground',
					)}
				>
					<div className="flex items-center">
						{selected && (
							<CountryFlag countryCode={selected.alpha3} className="w-6 mr-2" />
						)}
						{selected ? selected.name : 'Select a country'}
					</div>
					<ChevronDown className="ml-2 h-4 w-4 shrink-0" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[--radix-popover-trigger-width] p-0"
				align="start"
			>
				<Command className="bg-white">
					<CommandInput placeholder="Search countries..." />
					<CommandList>
						<CommandEmpty>No country found.</CommandEmpty>
						<CommandGroup className="max-h-64 overflow-auto">
							{countryOptions.length === 0 && (
								<div className="p-2 text-sm text-muted-foreground">
									Loading countries...
								</div>
							)}
							{countryOptions.map((country) => (
								<CommandItem
									key={country.alpha3}
									value={country.name}
									onSelect={() => handleSelect(country.alpha3)}
									className="cursor-pointer"
								>
									<Check
										className={cn(
											'mr-2 h-4 w-4',
											selected?.alpha3 === country.alpha3
												? 'opacity-100'
												: 'opacity-0',
										)}
									/>
									<CountryFlag countryCode={country.alpha3} />
									{country.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
